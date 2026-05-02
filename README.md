# Scrabble Online

A fully playable real-time multiplayer Scrabble game built with React, Node.js, Express, and Socket.IO.

![Screenshot placeholder](screenshot.png)

## Features

- 2–4 player multiplayer via room codes
- Bot players with basic AI
- Full Scrabble rules: scoring, premium squares, bingo bonus, blank tiles, tile exchange
- Real-time updates via Socket.IO
- Drag-and-drop tile placement with @dnd-kit
- Reconnection support
- Premium wooden UI theme

## Local Development

### Prerequisites
- Node.js >= 18

### First-time setup

Install dependencies for both the server and client (only needed once):

```bash
cd /path/to/scrabble
npm install            # installs server dependencies
cd client && npm install   # installs client dependencies
```

### Running the game

You need **two terminal windows** open at the same time.

**Terminal 1 — Backend:**
```bash
cd /path/to/scrabble
npm run dev:server
```
You should see: `Scrabble server running on port 3000`

**Terminal 2 — Frontend:**
```bash
cd /path/to/scrabble
npm run dev:client
```
You should see: `Local: http://localhost:5173/`

Then open **http://localhost:5173** in your browser.

The Vite dev server automatically proxies Socket.IO traffic to port 3000, so no URL changes are needed.

### Word List

The game bundles a comprehensive word list at `server/data/words.txt`. To use the full Collins Scrabble Words (CSW21) list:

1. Download from a public GitHub source (search "scrabble-wordlist CSW")
2. Replace `server/data/words.txt` with the downloaded file (one word per line, uppercase)

## Railway Deployment

1. Connect this repository to Railway
2. Set environment variables:
   - `PORT` — Railway sets this automatically
   - `NODE_ENV=production`
3. Railway will run `npm run build` then `npm start`

The server serves the built React client as static files in production.

## Game Rules Summary

- 2–4 players take turns placing tiles on a 15×15 board
- First move must cover the centre square (H8) with at least 2 tiles
- All tiles in a turn must be in the same row or column
- Every word formed must be a valid Scrabble word
- Premium squares: TW (×3 word), DW (×2 word), TL (×3 letter), DL (×2 letter)
- Playing all 7 tiles in one turn earns a 50-point bonus (Bingo)
- Blank tiles can represent any letter but score 0
- Game ends when a player uses all tiles with an empty bag, or all players pass twice

## Known Limitations

- Bot AI uses a simple word-finding approach (may miss high-value plays)
- Challenge rule not implemented (server auto-validates all words)
- No persistent game history between sessions
