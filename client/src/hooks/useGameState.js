import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Connection state
  screen: 'home', // 'home' | 'lobby' | 'game' | 'gameover'
  roomCode: null,
  playerId: null,
  playerName: null,

  // Lobby
  lobby: null,

  // Game state
  board: null,
  players: [],
  currentPlayerId: null,
  tilesInBag: 0,
  rack: [],
  pendingPlacements: [], // tiles placed on board but not committed
  selectedTileId: null,
  moveLog: [],
  gameOver: false,
  winner: null,
  lastMoveResult: null,
  // Animation: cells placed in the most recent opponent/bot move
  // Each entry: { row, col, delay } where delay is stagger ms
  lastPlacedCells: [],
  opponentMoveAnnouncement: null, // { playerName, words, score }

  // Actions
  setScreen: (screen) => set({ screen }),
  setRoomInfo: ({ roomCode, playerId, playerName }) =>
    set({ roomCode, playerId, playerName }),
  setLobby: (lobby) => set({ lobby }),

  handleGameStarted: (state) => {
    set({
      screen: 'game',
      board: state.board,
      players: state.players,
      currentPlayerId: state.currentPlayerId,
      tilesInBag: state.tilesInBag,
      moveLog: state.moveLog || [],
      gameOver: false,
      winner: null,
      pendingPlacements: [],
    });
  },

  handleStateUpdate: (state) => {
    const { board: oldBoard, moveLog: oldMoveLog, playerId } = get();

    // Diff old vs new board to find newly placed cells
    const newCells = [];
    if (oldBoard?.grid && state.board?.grid) {
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          if (!oldBoard.grid[r][c] && state.board.grid[r][c]) {
            newCells.push({ row: r, col: c });
          }
        }
      }
    }

    // Sort cells for left-to-right / top-to-bottom stagger
    if (newCells.length > 1) {
      const allSameRow = newCells.every(c => c.row === newCells[0].row);
      newCells.sort((a, b) => allSameRow ? a.col - b.col : a.row - b.row);
    }
    const lastPlacedCells = newCells.map((cell, i) => ({ ...cell, delay: i * 90 }));

    // Detect if the latest log entry is from another player (opponent or bot)
    const newLog = state.moveLog || [];
    const latestEntry = newLog[newLog.length - 1];
    const oldLength = (oldMoveLog || []).length;
    let opponentMoveAnnouncement = null;
    if (latestEntry && newLog.length > oldLength && latestEntry.playerId !== playerId && latestEntry.type === 'play') {
      opponentMoveAnnouncement = {
        playerName: latestEntry.playerName,
        words: latestEntry.words,
        score: latestEntry.score,
      };
    }

    set({
      board: state.board,
      players: state.players,
      currentPlayerId: state.currentPlayerId,
      tilesInBag: state.tilesInBag,
      moveLog: newLog,
      gameOver: state.gameOver,
      winner: state.winner,
      lastPlacedCells,
      opponentMoveAnnouncement,
    });

    if (state.gameOver) set({ screen: 'gameover' });

    // Clear animation state after tiles finish animating
    if (lastPlacedCells.length > 0) {
      const totalDuration = (lastPlacedCells.length - 1) * 90 + 2500;
      setTimeout(() => {
        useGameStore.setState({ lastPlacedCells: [], opponentMoveAnnouncement: null });
      }, totalDuration);
    }
  },

  handleTileUpdate: ({ rack }) => set({ rack }),

  handleMoveValid: ({ words, score }) => {
    set({ pendingPlacements: [], lastMoveResult: { type: 'valid', words, score } });
  },

  handleMoveInvalid: ({ reason }) => {
    const { pendingPlacements, rack } = get();
    // Return pending tiles to rack
    const returnedTiles = pendingPlacements.map(p => ({
      id: p.tileId,
      letter: p.letter,
      value: p.value,
      isBlank: p.isBlank,
    }));
    set({
      rack: [...rack, ...returnedTiles],
      pendingPlacements: [],
      lastMoveResult: { type: 'invalid', reason },
    });
  },

  // Place a tile from rack to board
  placeTile: (tileId, row, col) => {
    const { rack, pendingPlacements, board } = get();
    const boardCell = board?.grid?.[row]?.[col];
    if (boardCell) return false; // cell occupied

    // Check not already placed
    if (pendingPlacements.some(p => p.row === row && p.col === col)) return false;

    const tileIdx = rack.findIndex(t => t.id === tileId);
    if (tileIdx === -1) return false;

    const tile = rack[tileIdx];
    const newRack = rack.filter((_, i) => i !== tileIdx);

    set({
      rack: newRack,
      pendingPlacements: [...pendingPlacements, {
        row, col, tileId: tile.id,
        letter: tile.letter, value: tile.value, isBlank: tile.isBlank,
        blankLetter: tile.isBlank ? undefined : undefined,
      }],
      selectedTileId: null,
    });
    return true;
  },

  // Return a single pending tile from the board back to the rack
  removePendingTile: (row, col) => {
    const { rack, pendingPlacements } = get();
    const placement = pendingPlacements.find(p => p.row === row && p.col === col);
    if (!placement) return;
    set({
      rack: [...rack, {
        id: placement.tileId,
        letter: placement.letter,
        value: placement.value,
        isBlank: placement.isBlank,
      }],
      pendingPlacements: pendingPlacements.filter(p => !(p.row === row && p.col === col)),
    });
  },

  // Move a pending tile from one board cell to another
  movePendingTile: (fromRow, fromCol, toRow, toCol) => {
    const { pendingPlacements, board } = get();
    if (fromRow === toRow && fromCol === toCol) return;
    if (board?.grid?.[toRow]?.[toCol]) return; // committed tile there
    if (pendingPlacements.some(p => p.row === toRow && p.col === toCol)) return; // pending tile there
    set({
      pendingPlacements: pendingPlacements.map(p =>
        p.row === fromRow && p.col === fromCol ? { ...p, row: toRow, col: toCol } : p
      ),
    });
  },

  setBlankLetter: (tileId, letter) => {
    const { pendingPlacements } = get();
    set({
      pendingPlacements: pendingPlacements.map(p =>
        p.tileId === tileId ? { ...p, blankLetter: letter } : p
      ),
    });
  },

  recallTiles: () => {
    const { rack, pendingPlacements } = get();
    const returnedTiles = pendingPlacements.map(p => ({
      id: p.tileId,
      letter: p.letter,
      value: p.value,
      isBlank: p.isBlank,
    }));
    set({ rack: [...rack, ...returnedTiles], pendingPlacements: [] });
  },

  setSelectedTile: (tileId) => set({ selectedTileId: tileId }),

  clearLastMoveResult: () => set({ lastMoveResult: null }),
}));
