require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const WordValidator = require('./game/WordValidator');
const RoomManager = require('./rooms/RoomManager');

WordValidator.load();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  );
}

// --- Socket.IO ---

function emitGameState(room, io) {
  if (!room.game) return;
  const state = room.game.getPublicState();
  io.to(room.code).emit('game:stateUpdate', state);

  for (const player of room.players) {
    if (!player.isBot && player.socketId) {
      const rack = room.game.getPlayerRack(player.id);
      io.to(player.socketId).emit('player:tileUpdate', { rack });
    }
  }
}

async function runBotTurns(room, io) {
  while (room.game && room.game.isBotTurn() && !room.game.gameOver) {
    const result = await room.game.processBotTurn();
    emitGameState(room, io);

    if (room.game.gameOver) {
      io.to(room.code).emit('game:ended', room.game.getPublicState());
      room.status = 'ended';
      return;
    }
  }
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('room:create', ({ playerName, totalPlayers, botCount }) => {
    const humanCount = Math.max(1, totalPlayers - botCount);
    const safeBotCount = Math.min(botCount, totalPlayers - 1);
    const { room, playerId } = RoomManager.createRoom({
      playerName: playerName?.trim() || 'Player',
      playerSocketId: socket.id,
      totalPlayers: Math.min(4, Math.max(2, totalPlayers)),
      botCount: safeBotCount,
    });

    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.playerId = playerId;

    socket.emit('room:joined', {
      roomCode: room.code,
      playerId,
      lobby: RoomManager.getLobbyState(room),
    });

    // If only bots needed (solo), start immediately
    const humans = room.players.filter(p => !p.isBot);
    if (humans.length >= room.humanCount) {
      // all human slots filled
    }
  });

  socket.on('room:join', ({ playerName, roomCode }) => {
    const result = RoomManager.joinRoom({
      code: roomCode?.toUpperCase(),
      playerName: playerName?.trim() || 'Player',
      playerSocketId: socket.id,
    });

    if (result.error) {
      socket.emit('room:error', { message: result.error });
      return;
    }

    const { room, playerId, reconnected } = result;
    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.playerId = playerId;

    socket.emit('room:joined', {
      roomCode: room.code,
      playerId,
      lobby: RoomManager.getLobbyState(room),
      reconnected,
    });

    if (reconnected && room.game) {
      socket.emit('game:started', room.game.getPublicState());
      const rack = room.game.getPlayerRack(playerId);
      socket.emit('player:tileUpdate', { rack });
      socket.emit('player:reconnected', { playerId });
    } else {
      io.to(room.code).emit('player:joined', {
        lobby: RoomManager.getLobbyState(room),
        playerName: playerName?.trim(),
      });
    }
  });

  socket.on('game:start', async () => {
    const { roomCode, playerId } = socket.data;
    const result = RoomManager.startGame(roomCode, playerId);

    if (result.error) {
      socket.emit('room:error', { message: result.error });
      return;
    }

    const { room } = result;
    const initialState = room.game.getPublicState();
    io.to(room.code).emit('game:started', initialState);

    // Send private racks
    for (const player of room.players) {
      if (!player.isBot && player.socketId) {
        const rack = room.game.getPlayerRack(player.id);
        io.to(player.socketId).emit('player:tileUpdate', { rack });
      }
    }

    await runBotTurns(room, io);
  });

  socket.on('game:placeTiles', async ({ placements }) => {
    const { roomCode, playerId } = socket.data;
    const room = RoomManager.getRoom(roomCode);
    if (!room || !room.game) return;

    const result = room.game.processMove(playerId, placements);

    if (!result.valid) {
      socket.emit('move:invalid', { reason: result.error });
      return;
    }

    socket.emit('move:valid', { words: result.words, score: result.score });
    emitGameState(room, io);

    if (room.game.gameOver) {
      io.to(room.code).emit('game:ended', room.game.getPublicState());
      room.status = 'ended';
      return;
    }

    await runBotTurns(room, io);
  });

  socket.on('game:exchangeTiles', async ({ tileIds }) => {
    const { roomCode, playerId } = socket.data;
    const room = RoomManager.getRoom(roomCode);
    if (!room || !room.game) return;

    const result = room.game.exchangeTiles(playerId, tileIds);

    if (!result.valid) {
      socket.emit('move:invalid', { reason: result.error });
      return;
    }

    emitGameState(room, io);
    if (!room.game.gameOver) await runBotTurns(room, io);
  });

  socket.on('game:pass', async () => {
    const { roomCode, playerId } = socket.data;
    const room = RoomManager.getRoom(roomCode);
    if (!room || !room.game) return;

    const result = room.game.passTurn(playerId);

    if (!result.valid) {
      socket.emit('move:invalid', { reason: result.error });
      return;
    }

    emitGameState(room, io);

    if (room.game.gameOver) {
      io.to(room.code).emit('game:ended', room.game.getPublicState());
      room.status = 'ended';
      return;
    }

    await runBotTurns(room, io);
  });

  socket.on('disconnect', () => {
    const { roomCode } = socket.data || {};
    if (!roomCode) return;
    const player = RoomManager.removePlayer(roomCode, socket.id);
    if (player) {
      const room = RoomManager.getRoom(roomCode);
      if (room) {
        io.to(room.code).emit('player:left', {
          playerId: player.id,
          playerName: player.name,
          lobby: RoomManager.getLobbyState(room),
        });
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Scrabble server running on port ${PORT}`);
});
