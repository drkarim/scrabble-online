import React from 'react';
import { useGameStore } from '../hooks/useGameState';

const AVATAR_COLORS = ['#c8a46e', '#5a8a6a', '#4a6a9a', '#8a4a6a', '#6a4a8a'];

export default function ScoreBoard() {
  const { players, currentPlayerId, tilesInBag, playerId } = useGameStore();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="text-xs px-2 py-1 rounded"
        style={{ background: '#1a2a1a', color: '#5a8a6a', border: '1px solid #2d4a2a' }}>
        🎲 {tilesInBag} tiles
      </div>
      {players.map((p, i) => {
        const isActive = p.id === currentPlayerId;
        const isMe = p.id === playerId;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${isActive ? 'active-player' : ''}`}
            style={{
              background: isActive ? '#1a3a2a' : '#111820',
              border: `1px solid ${isActive ? '#3d8a5a' : '#2d3a4a'}`,
              minWidth: 80,
            }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: '#0d1117' }}>
              {p.isBot ? '🤖' : p.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-medium leading-none"
                style={{ color: isActive ? '#c8a46e' : '#e8dcc8' }}>
                {p.name.length > 8 ? p.name.slice(0, 8) + '…' : p.name}
                {isMe && <span style={{ color: '#5a8a6a', fontSize: 9 }}> (you)</span>}
              </div>
              <div className="text-sm font-bold leading-none mt-0.5"
                style={{ color: isActive ? '#c8a46e' : '#a0b0a0' }}>
                {p.score}
              </div>
            </div>
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: '#5aaa6a', boxShadow: '0 0 4px #5aaa6a' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
