const { nanoid } = require('../utils/nanoid');
const GameEngine = require('../game/GameEngine');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  createRoom({ playerName, playerSocketId, totalPlayers, botCount }) {
    let code;
    do { code = this._generateCode(); } while (this.rooms.has(code));

    const humanCount = totalPlayers - botCount;
    const hostId = `player_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const players = [
      { id: hostId, name: playerName, socketId: playerSocketId, isHost: true, isBot: false },
    ];

    for (let i = 0; i < botCount; i++) {
      const botId = `bot_${Date.now()}_${i}`;
      players.push({ id: botId, name: `Bot ${i + 1}`, socketId: null, isHost: false, isBot: true });
    }

    const room = {
      code,
      hostId,
      totalPlayers,
      humanCount,
      botCount,
      players,
      status: 'lobby',
      game: null,
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    return { room, playerId: hostId };
  }

  joinRoom({ code, playerName, playerSocketId }) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'Room not found' };
    if (room.status === 'ended') return { error: 'Game has ended' };

    // Check for reconnection
    const existing = room.players.find(
      p => !p.isBot && p.name === playerName && room.status === 'playing'
    );
    if (existing) {
      existing.socketId = playerSocketId;
      if (room.game) room.game.updateSocketId(existing.id, playerSocketId);
      return { room, playerId: existing.id, reconnected: true };
    }

    if (room.status === 'playing') return { error: 'Game already in progress' };

    const humanSlots = room.players.filter(p => !p.isBot).length;
    if (humanSlots >= room.humanCount) return { error: 'Room is full' };

    if (room.players.some(p => !p.isBot && p.name === playerName)) {
      return { error: 'Name already taken in this room' };
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    room.players.push({
      id: playerId,
      name: playerName,
      socketId: playerSocketId,
      isHost: false,
      isBot: false,
    });

    return { room, playerId };
  }

  startGame(code, requestingPlayerId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostId !== requestingPlayerId) return { error: 'Only the host can start the game' };
    if (room.status !== 'lobby') return { error: 'Game already started' };

    const humans = room.players.filter(p => !p.isBot);
    if (humans.length === 0) return { error: 'Need at least one human player' };

    room.status = 'playing';
    room.game = new GameEngine(code, room.players);

    return { success: true, room };
  }

  getRoom(code) {
    return this.rooms.get(code?.toUpperCase());
  }

  removePlayer(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return null;
    const player = room.players.find(p => p.socketId === socketId);
    if (player) player.socketId = null;
    return player;
  }

  getRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) return room;
    }
    return null;
  }

  getLobbyState(room) {
    return {
      code: room.code,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isBot: p.isBot,
        connected: !!p.socketId,
      })),
      totalPlayers: room.totalPlayers,
      status: room.status,
    };
  }
}

module.exports = new RoomManager();
