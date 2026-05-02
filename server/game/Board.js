const BOARD_SIZE = 15;

const TW_SET = new Set(['0,0','0,7','0,14','7,0','7,14','14,0','14,7','14,14']);
const DW_SET = new Set(['1,1','2,2','3,3','4,4','7,7','10,10','11,11','12,12','13,13','1,13','2,12','3,11','4,10','10,4','11,3','12,2','13,1']);
const TL_SET = new Set(['1,5','1,9','5,1','5,5','5,9','5,13','9,1','9,5','9,9','9,13','13,5','13,9']);
const DL_SET = new Set(['0,3','0,11','2,6','2,8','3,0','3,7','3,14','6,2','6,6','6,8','6,12','7,3','7,11','8,2','8,6','8,8','8,12','11,0','11,7','11,14','12,6','12,8','14,3','14,11']);

class Board {
  constructor() {
    this.grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    this.isEmpty = true;
  }

  getSquareType(row, col) {
    const key = `${row},${col}`;
    if (TW_SET.has(key)) return 'TW';
    if (DW_SET.has(key)) return 'DW';
    if (TL_SET.has(key)) return 'TL';
    if (DL_SET.has(key)) return 'DL';
    return null;
  }

  getTile(row, col) {
    return this.grid[row]?.[col] || null;
  }

  isOccupied(row, col) {
    return !!(this.grid[row]?.[col]);
  }

  validatePlacement(placements) {
    if (!placements || placements.length === 0) {
      return { valid: false, error: 'No tiles placed' };
    }

    for (const p of placements) {
      if (p.row < 0 || p.row >= BOARD_SIZE || p.col < 0 || p.col >= BOARD_SIZE) {
        return { valid: false, error: 'Tile out of bounds' };
      }
      if (this.isOccupied(p.row, p.col)) {
        return { valid: false, error: `Square (${p.row},${p.col}) is already occupied` };
      }
    }

    const rows = [...new Set(placements.map(p => p.row))];
    const cols = [...new Set(placements.map(p => p.col))];

    if (rows.length > 1 && cols.length > 1) {
      return { valid: false, error: 'All tiles must be in the same row or column' };
    }

    const positions = new Set(placements.map(p => `${p.row},${p.col}`));
    if (positions.size !== placements.length) {
      return { valid: false, error: 'Duplicate tile positions' };
    }

    if (rows.length === 1) {
      const row = rows[0];
      const minCol = Math.min(...placements.map(p => p.col));
      const maxCol = Math.max(...placements.map(p => p.col));
      for (let c = minCol; c <= maxCol; c++) {
        if (!positions.has(`${row},${c}`) && !this.isOccupied(row, c)) {
          return { valid: false, error: 'Gap in tile placement' };
        }
      }
    } else if (cols.length === 1) {
      const col = cols[0];
      const minRow = Math.min(...placements.map(p => p.row));
      const maxRow = Math.max(...placements.map(p => p.row));
      for (let r = minRow; r <= maxRow; r++) {
        if (!positions.has(`${r},${col}`) && !this.isOccupied(r, col)) {
          return { valid: false, error: 'Gap in tile placement' };
        }
      }
    }

    if (this.isEmpty) {
      if (!placements.some(p => p.row === 7 && p.col === 7)) {
        return { valid: false, error: 'First move must cover the centre square' };
      }
      if (placements.length < 2) {
        return { valid: false, error: 'First move must be at least 2 letters' };
      }
    } else {
      const connects = placements.some(p => this._isAdjacentToExisting(p.row, p.col, positions));
      if (!connects) {
        return { valid: false, error: 'Tiles must connect to existing tiles on the board' };
      }
    }

    return { valid: true };
  }

  _isAdjacentToExisting(row, col, newPositions) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (this.isOccupied(nr, nc) && !newPositions.has(`${nr},${nc}`)) return true;
      }
    }
    return false;
  }

  getWordsFormed(placements) {
    const tempGrid = this.grid.map(row => row.map(cell => cell ? { ...cell } : null));
    const newPositions = new Set(placements.map(p => `${p.row},${p.col}`));

    for (const p of placements) {
      tempGrid[p.row][p.col] = {
        letter: p.isBlank ? (p.blankLetter || '?') : p.letter,
        value: p.value ?? 0,
        isBlank: !!p.isBlank,
        isNew: true,
      };
    }

    const words = [];
    const checkedH = new Set();
    const checkedV = new Set();

    for (const p of placements) {
      const hStart = this._wordStart(tempGrid, p.row, p.col, 'H');
      const hKey = `H,${p.row},${hStart}`;
      if (!checkedH.has(hKey)) {
        checkedH.add(hKey);
        const w = this._extractWord(tempGrid, p.row, hStart, 'H');
        if (w.word.length >= 2) {
          words.push({ ...w, direction: 'H', containsNew: w.cells.some(c => newPositions.has(`${c.row},${c.col}`)) });
        }
      }

      const vStart = this._wordStart(tempGrid, p.row, p.col, 'V');
      const vKey = `V,${vStart},${p.col}`;
      if (!checkedV.has(vKey)) {
        checkedV.add(vKey);
        const w = this._extractWord(tempGrid, vStart, p.col, 'V');
        if (w.word.length >= 2) {
          words.push({ ...w, direction: 'V', containsNew: w.cells.some(c => newPositions.has(`${c.row},${c.col}`)) });
        }
      }
    }

    return words.filter(w => w.containsNew);
  }

  _wordStart(grid, row, col, dir) {
    if (dir === 'H') {
      while (col > 0 && grid[row][col - 1]) col--;
      return col;
    } else {
      while (row > 0 && grid[row - 1][col]) row--;
      return row;
    }
  }

  _extractWord(grid, row, col, dir) {
    const cells = [];
    let r = row, c = col;
    while (r < BOARD_SIZE && c < BOARD_SIZE && grid[r][c]) {
      cells.push({ row: r, col: c, tile: grid[r][c] });
      if (dir === 'H') c++;
      else r++;
    }
    return {
      word: cells.map(cell => cell.tile.letter).join(''),
      cells,
      startRow: row,
      startCol: col,
    };
  }

  calculateScore(placements, wordsFormed) {
    const newPositions = new Set(placements.map(p => `${p.row},${p.col}`));
    let totalScore = 0;

    for (const wordInfo of wordsFormed) {
      let wordScore = 0;
      let wordMultiplier = 1;

      for (const cell of wordInfo.cells) {
        const isNew = newPositions.has(`${cell.row},${cell.col}`);
        let letterValue = cell.tile.isBlank ? 0 : (cell.tile.value ?? 0);

        if (isNew) {
          const sq = this.getSquareType(cell.row, cell.col);
          if (sq === 'TL') letterValue *= 3;
          else if (sq === 'DL') letterValue *= 2;
          else if (sq === 'TW') wordMultiplier *= 3;
          else if (sq === 'DW') wordMultiplier *= 2;
        }

        wordScore += letterValue;
      }

      totalScore += wordScore * wordMultiplier;
    }

    if (placements.length === 7) totalScore += 50;

    return totalScore;
  }

  applyPlacements(placements) {
    for (const p of placements) {
      this.grid[p.row][p.col] = {
        letter: p.isBlank ? (p.blankLetter || '?') : p.letter,
        value: p.value ?? 0,
        isBlank: !!p.isBlank,
        tileId: p.tileId,
      };
    }
    this.isEmpty = false;
  }

  toJSON() {
    return { grid: this.grid, isEmpty: this.isEmpty };
  }

  static fromJSON(data) {
    const b = new Board();
    b.grid = data.grid;
    b.isEmpty = data.isEmpty;
    return b;
  }
}

module.exports = Board;
