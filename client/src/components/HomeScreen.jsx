import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameState';

export default function HomeScreen({ emit }) {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [botCount, setBotCount] = useState(1);
  const { setRoomInfo } = useGameStore();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    useGameStore.setState({ playerName: playerName.trim() });
    emit('room:create', {
      playerName: playerName.trim(),
      totalPlayers,
      botCount,
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    useGameStore.setState({ playerName: playerName.trim() });
    emit('room:join', {
      playerName: playerName.trim(),
      roomCode: roomCode.trim().toUpperCase(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #0f1f14 0%, #0d1117 70%)' }}>

      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-6xl md:text-7xl font-cinzel font-bold tracking-widest mb-2"
          style={{
            color: '#c8a46e',
            textShadow: '0 0 30px rgba(200,164,110,0.4), 0 0 60px rgba(26,90,42,0.3)',
          }}>
          SCRABBLE
        </h1>
        <div className="text-sm tracking-[0.4em] uppercase"
          style={{ color: '#5a8a6a' }}>
          Online Multiplayer
        </div>
        <div className="mt-4 flex justify-center gap-1">
          {'SCRABBLE'.split('').map((l, i) => (
            <div key={i} className="w-8 h-8 flex items-center justify-center rounded-sm text-sm font-bold"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #faebd7 0%, #f5deb3 40%, #d4b483 100%)',
                color: '#2c1810',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.5)',
                fontFamily: '"IM Fell English", serif',
                border: '1px solid #b8860b',
              }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Main buttons */}
      {!mode && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => setMode('create')}
            className="py-4 px-8 rounded-xl text-lg font-semibold tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #1a4a2a, #2d6a3e)',
              color: '#e8dcc8',
              border: '1px solid #3d8a5a',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}>
            Create Room
          </button>
          <button onClick={() => setMode('join')}
            className="py-4 px-8 rounded-xl text-lg font-semibold tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #1a2a3a, #2d3d5a)',
              color: '#e8dcc8',
              border: '1px solid #3d5a8a',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}>
            Join Room
          </button>
        </div>
      )}

      {/* Create Room form */}
      {mode === 'create' && (
        <form onSubmit={handleCreate}
          className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: '#111820', border: '1px solid #2d4a3a' }}>
          <h2 className="text-xl font-cinzel text-center" style={{ color: '#c8a46e' }}>
            Create Room
          </h2>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: '#7a9a8a' }}>
              Your Name
            </label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-2 rounded-lg text-sm outline-none"
              style={{
                background: '#0d1117',
                border: '1px solid #2d4a3a',
                color: '#e8dcc8',
              }}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: '#7a9a8a' }}>
              Total Players: {totalPlayers}
            </label>
            <input type="range" min={2} max={4} value={totalPlayers}
              onChange={e => {
                const v = +e.target.value;
                setTotalPlayers(v);
                setBotCount(Math.min(botCount, v - 1));
              }}
              className="w-full accent-green-700" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: '#7a9a8a' }}>
              Bot Players: {botCount} (Humans: {totalPlayers - botCount})
            </label>
            <input type="range" min={0} max={totalPlayers - 1} value={botCount}
              onChange={e => setBotCount(+e.target.value)}
              className="w-full accent-green-700" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setMode(null)}
              className="flex-1 py-2 rounded-lg text-sm"
              style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
              Back
            </button>
            <button type="submit"
              disabled={!playerName.trim()}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#1a4a2a', color: '#e8dcc8', border: '1px solid #3d8a5a' }}>
              Create
            </button>
          </div>
        </form>
      )}

      {/* Join Room form */}
      {mode === 'join' && (
        <form onSubmit={handleJoin}
          className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: '#111820', border: '1px solid #2d4a3a' }}>
          <h2 className="text-xl font-cinzel text-center" style={{ color: '#c8a46e' }}>
            Join Room
          </h2>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: '#7a9a8a' }}>
              Your Name
            </label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#0d1117', border: '1px solid #2d4a3a', color: '#e8dcc8' }}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: '#7a9a8a' }}>
              Room Code
            </label>
            <input
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full px-4 py-2 rounded-lg text-sm outline-none text-center tracking-[0.3em] font-mono"
              style={{ background: '#0d1117', border: '1px solid #2d4a3a', color: '#c8a46e' }}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setMode(null)}
              className="flex-1 py-2 rounded-lg text-sm"
              style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
              Back
            </button>
            <button type="submit"
              disabled={!playerName.trim() || roomCode.length < 6}
              className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: '#1a3a5a', color: '#e8dcc8', border: '1px solid #3d5a8a' }}>
              Join
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-xs" style={{ color: '#2d4a3a' }}>
        Share the room code with friends to play together
      </p>
    </div>
  );
}
