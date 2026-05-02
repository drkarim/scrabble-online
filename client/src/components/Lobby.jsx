import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameState';

const AVATAR_COLORS = ['#c8a46e', '#5a8a6a', '#4a6a9a', '#8a4a6a', '#6a4a8a'];

export default function Lobby({ emit }) {
  const { roomCode, playerId, lobby } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!lobby) return null;

  const isHost = lobby.players.find(p => p.id === playerId)?.isHost;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    emit('game:start');
  };

  const humanCount = lobby.players.filter(p => !p.isBot && p.connected).length;
  const canStart = isHost && humanCount >= 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #0f1f14 0%, #0d1117 70%)' }}>

      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#111820', border: '1px solid #2d4a3a' }}>

        <h2 className="text-2xl font-cinzel text-center mb-6" style={{ color: '#c8a46e' }}>
          Game Lobby
        </h2>

        {/* Room code */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-2 text-center" style={{ color: '#5a8a6a' }}>
            Room Code
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl font-mono font-bold tracking-[0.3em] px-6 py-3 rounded-xl"
              style={{
                background: '#0d1117',
                color: '#c8a46e',
                border: '2px solid #3d6a4a',
                letterSpacing: '0.3em',
              }}>
              {roomCode}
            </div>
            <button onClick={handleCopy}
              className="px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: copied ? '#1a4a2a' : '#1a2530',
                color: copied ? '#5aaa6a' : '#7a9a8a',
                border: `1px solid ${copied ? '#3d8a5a' : '#2d3a4a'}`,
              }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: '#3d5a4a' }}>
            Share this code with friends
          </p>
        </div>

        {/* Players */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#5a8a6a' }}>
            Players ({lobby.players.length}/{lobby.totalPlayers})
          </div>
          <div className="flex flex-col gap-2">
            {lobby.players.map((p, i) => (
              <div key={p.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: '#0d1117', border: '1px solid #1d3a2a' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: '#0d1117' }}>
                  {p.isBot ? '🤖' : p.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: '#e8dcc8' }}>
                    {p.name}
                  </span>
                  {p.isBot && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded"
                      style={{ background: '#1a3a5a', color: '#7aaacc' }}>
                      Bot
                    </span>
                  )}
                  {p.isHost && !p.isBot && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded"
                      style={{ background: '#3a2a0a', color: '#c8a46e' }}>
                      Host
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full"
                  style={{ background: p.isBot || p.connected ? '#3a8a4a' : '#8a3a3a' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost && (
            <button onClick={handleStart}
              disabled={!canStart}
              className="py-3 rounded-xl text-base font-semibold tracking-wider transition-all disabled:opacity-40"
              style={{
                background: canStart ? 'linear-gradient(135deg, #1a4a2a, #2d6a3e)' : '#1a2530',
                color: '#e8dcc8',
                border: '1px solid #3d8a5a',
              }}>
              Start Game
            </button>
          )}
          {!isHost && (
            <div className="text-center text-sm py-2" style={{ color: '#5a8a6a' }}>
              Waiting for host to start...
            </div>
          )}
          <button onClick={() => {
            useGameStore.setState({ screen: 'home', lobby: null, roomCode: null });
          }}
            className="py-2 rounded-lg text-sm"
            style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
