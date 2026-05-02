const fs = require('fs');
const path = require('path');

class WordValidator {
  constructor() {
    this.wordSet = new Set();
    this.loaded = false;
  }

  load() {
    const wordsPath = path.join(__dirname, '../data/words.txt');
    const content = fs.readFileSync(wordsPath, 'utf-8');
    const words = content
      .split('\n')
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length >= 2 && /^[A-Z]+$/.test(w));
    this.wordSet = new Set(words);
    this.loaded = true;
    console.log(`Loaded ${this.wordSet.size} words`);
  }

  isValid(word) {
    return this.wordSet.has(word.toUpperCase());
  }

  validateWords(words) {
    const invalid = words.filter(w => !this.isValid(w));
    return {
      valid: invalid.length === 0,
      invalidWords: invalid,
    };
  }
}

module.exports = new WordValidator();
