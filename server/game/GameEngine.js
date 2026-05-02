const Board = require('./Board');
const TileBag = require('./TileBag');
const WordValidator = require('./WordValidator');
const BotPlayer = require('./BotPlayer');

class GameEngine {
  constructor(gameId, players) {
    this.gameId = gameId;
    this.board = new Board();
    this.bag = new TileBag();
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      isBot: !!p.isBot,
      socketId: p.socketId || null,
      rack: [],
      score: 0,
    }));
    this.currentPlayerIndex = 0;
    this.gameOver = false;
    this.winner = null;
    this.moveLog = [];
    this.consecutivePasses = 0;

    this._shufflePlayers();
    for (const player of this.players) {
      player.rack = this.bag.draw(7);
    }
  }

  _shufflePlayers() {
    for (let i = this.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  validateMove(playerId, placements) {
    const player = this.getPlayerById(playerId);
    if (!player) return { valid: false, error: 'Player not found' };
    if (this.gameOver) return { valid: false, error: 'Game is over' };
    if (this.currentPlayer.id !== playerId) return { valid: false, error: 'Not your turn' };

    const rackCopy = [...player.rack];
    for (const p of placements) {
      const idx = rackCopy.findIndex(t => t.id === p.tileId);
      if (idx === -1) return { valid: false, error: `Tile ${p.tileId} not found in rack` };
      if (p.isBlank && !p.blankLetter) return { valid: false, error: 'Must declare a letter for blank tile' };
      rackCopy.splice(idx, 1);
    }

    const placementResult = this.board.validatePlacement(placements);
    if (!placementResult.valid) return placementResult;

    const wordsFormed = this.board.getWordsFormed(placements);
    if (wordsFormed.length === 0) return { valid: false, error: 'No words formed' };

    const wordStrings = wordsFormed.map(w => w.word);
    const dictResult = WordValidator.validateWords(wordStrings);
    if (!dictResult.valid) {
      return {
        valid: false,
        error: `Invalid word(s): ${dictResult.invalidWords.join(', ')}`,
      };
    }

    const score = this.board.calculateScore(placements, wordsFormed);
    return { valid: true, words: wordStrings, score, wordsFormed };
  }

  processMove(playerId, placements) {
    const validation = this.validateMove(playerId, placements);
    if (!validation.valid) return validation;

    const player = this.getPlayerById(playerId);

    this.board.applyPlacements(placements);

    for (const p of placements) {
      const idx = player.rack.findIndex(t => t.id === p.tileId);
      if (idx !== -1) player.rack.splice(idx, 1);
    }

    const drawn = this.bag.draw(placements.length);
    player.rack.push(...drawn);

    player.score += validation.score;
    this.consecutivePasses = 0;

    this.moveLog.push({
      playerId,
      playerName: player.name,
      type: 'play',
      words: validation.words,
      score: validation.score,
      totalScore: player.score,
      timestamp: Date.now(),
    });

    if (player.rack.length === 0 && this.bag.remaining === 0) {
      this._endGame(playerId);
    } else {
      this._nextTurn();
    }

    return { valid: true, ...validation, newRack: player.rack };
  }

  exchangeTiles(playerId, tileIds) {
    const player = this.getPlayerById(playerId);
    if (!player) return { valid: false, error: 'Player not found' };
    if (this.gameOver) return { valid: false, error: 'Game is over' };
    if (this.currentPlayer.id !== playerId) return { valid: false, error: 'Not your turn' };
    if (this.bag.remaining < 7) return { valid: false, error: 'Not enough tiles in bag to exchange (need at least 7)' };

    const tilesToReturn = [];
    const rackCopy = [...player.rack];

    for (const id of tileIds) {
      const idx = rackCopy.findIndex(t => t.id === id);
      if (idx === -1) {
        return { valid: false, error: `Tile ${id} not found in rack` };
      }
      tilesToReturn.push(rackCopy.splice(idx, 1)[0]);
    }

    player.rack = rackCopy;
    const newTiles = this.bag.exchange(tilesToReturn);
    player.rack.push(...newTiles);

    this.consecutivePasses++;
    this.moveLog.push({
      playerId,
      playerName: player.name,
      type: 'exchange',
      count: tileIds.length,
      timestamp: Date.now(),
    });

    this._checkConsecutivePasses();
    if (!this.gameOver) this._nextTurn();

    return { valid: true, newRack: player.rack };
  }

  passTurn(playerId) {
    const player = this.getPlayerById(playerId);
    if (!player) return { valid: false, error: 'Player not found' };
    if (this.gameOver) return { valid: false, error: 'Game is over' };
    if (this.currentPlayer.id !== playerId) return { valid: false, error: 'Not your turn' };

    this.consecutivePasses++;
    this.moveLog.push({
      playerId,
      playerName: player.name,
      type: 'pass',
      timestamp: Date.now(),
    });

    this._checkConsecutivePasses();
    if (!this.gameOver) this._nextTurn();

    return { valid: true };
  }

  _checkConsecutivePasses() {
    if (this.consecutivePasses >= this.players.length * 2) {
      this._endGame(null);
    }
  }

  _nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  _endGame(triggeringPlayerId) {
    this.gameOver = true;
    let bonus = 0;

    for (const player of this.players) {
      if (player.rack.length > 0) {
        const rackValue = player.rack.reduce((sum, t) => sum + (t.value || 0), 0);
        player.score -= rackValue;
        if (triggeringPlayerId && player.id !== triggeringPlayerId) {
          bonus += rackValue;
        }
      }
    }

    if (triggeringPlayerId) {
      const trigger = this.getPlayerById(triggeringPlayerId);
      if (trigger) trigger.score += bonus;
    }

    const maxScore = Math.max(...this.players.map(p => p.score));
    this.winner = this.players.find(p => p.score === maxScore);
  }

  isBotTurn() {
    return !this.gameOver && this.currentPlayer.isBot;
  }

  async processBotTurn() {
    if (!this.isBotTurn()) return null;
    const bot = this.currentPlayer;

    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));

    if (this.gameOver) return null;

    const move = BotPlayer.findBestMove(this.board, bot.rack);
    if (move) {
      return this.processMove(bot.id, move);
    }
    if (this.bag.remaining >= 7) {
      const tileIds = bot.rack.map(t => t.id);
      return this.exchangeTiles(bot.id, tileIds);
    }
    return this.passTurn(bot.id);
  }

  getPublicState() {
    return {
      board: this.board.toJSON(),
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        rackSize: p.rack.length,
        isBot: p.isBot,
      })),
      currentPlayerId: this.currentPlayer.id,
      tilesInBag: this.bag.remaining,
      gameOver: this.gameOver,
      winner: this.winner
        ? { id: this.winner.id, name: this.winner.name, score: this.winner.score }
        : null,
      moveLog: this.moveLog,
    };
  }

  getPlayerRack(playerId) {
    const player = this.getPlayerById(playerId);
    return player ? player.rack : [];
  }

  updateSocketId(playerId, socketId) {
    const player = this.getPlayerById(playerId);
    if (player) player.socketId = socketId;
  }
}

module.exports = GameEngine;
