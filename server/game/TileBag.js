const DISTRIBUTION = {
  A: { count: 9, value: 1 },
  B: { count: 2, value: 3 },
  C: { count: 2, value: 3 },
  D: { count: 4, value: 2 },
  E: { count: 12, value: 1 },
  F: { count: 2, value: 4 },
  G: { count: 3, value: 2 },
  H: { count: 2, value: 4 },
  I: { count: 9, value: 1 },
  J: { count: 1, value: 8 },
  K: { count: 1, value: 5 },
  L: { count: 4, value: 1 },
  M: { count: 2, value: 3 },
  N: { count: 6, value: 1 },
  O: { count: 8, value: 1 },
  P: { count: 2, value: 3 },
  Q: { count: 1, value: 10 },
  R: { count: 6, value: 1 },
  S: { count: 4, value: 1 },
  T: { count: 6, value: 1 },
  U: { count: 4, value: 1 },
  V: { count: 2, value: 4 },
  W: { count: 2, value: 4 },
  X: { count: 1, value: 8 },
  Y: { count: 2, value: 4 },
  Z: { count: 1, value: 10 },
  '?': { count: 2, value: 0 },
};

class TileBag {
  constructor() {
    this.tiles = [];
    this._idCounter = 0;
    this._init();
  }

  _init() {
    for (const [letter, { count, value }] of Object.entries(DISTRIBUTION)) {
      for (let i = 0; i < count; i++) {
        this.tiles.push({
          id: `tile_${this._idCounter++}`,
          letter,
          value,
          isBlank: letter === '?',
        });
      }
    }
    this._shuffle();
  }

  _shuffle() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  draw(n) {
    return this.tiles.splice(0, Math.min(n, this.tiles.length));
  }

  exchange(returnedTiles) {
    const newTiles = this.draw(returnedTiles.length);
    this.tiles.push(...returnedTiles);
    this._shuffle();
    return newTiles;
  }

  get remaining() {
    return this.tiles.length;
  }

  toJSON() {
    return { remaining: this.tiles.length };
  }
}

module.exports = TileBag;
