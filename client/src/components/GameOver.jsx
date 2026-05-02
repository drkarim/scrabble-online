import React from 'react';
import { useGameStore } from '../hooks/useGameState';

export default function GameOver({ emit }) {
  const { players, winner, playerId, moveLog } = useGameStore();

  const sorted = [...players].sort((a, b) => b.score - a.score);

  const handlePlayAgain = () => {
    useGameStore.setState({
      screen: 'home',
      board: null,
      players: [],
      rack: [],
      pendingPlacements: [],
      moveLog: [],
      gameOver: false,
      winner: null,
      roomCode: null,
      lobby: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #0f1f14 0%, #0d1117 70%)' }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#111820', border: '1px solid #2d4a3a' }}>

        <h2 className="text-3xl font-cinzel text-center mb-2" style={{ color: '#c8a46e' }}>
          Game Over
        </h2>

        {winner && (
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-xl font-bold" style={{ color: '#c8a46e' }}>
              {winner.name} wins!
            </div>
            <div className="text-sm" style={{ color: '#5a8a6a' }}>
              {winner.score} points
            </div>
          </div>
        )}

        {/* Final scores */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#5a8a6a' }}>
            Final Scores
          </div>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => (
              <div key={p.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: i === 0 ? '#1a3a1a' : '#0d1117',
                  border: `1px solid ${i === 0 ? '#3d6a3a' : '#1d3a2a'}`,
                }}>
                <div className="text-lg w-6 text-center" style={{ color: i === 0 ? '#ffd700' : '#5a7a6a' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: '#e8dcc8' }}>
                    {p.name}
                    {p.id === playerId && (
                      <span className="ml-2 text-xs" style={{ color: '#5a8a6a' }}>(you)</span>
                    )}
                    {p.isBot && (
                      <span className="ml-2 text-xs px-1 rounded"
                        style={{ background: '#1a3a5a', color: '#7aaacc' }}>
                        Bot
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-base font-bold" style={{ color: i === 0 ? '#c8a46e' : '#a0b0a0' }}>
                  {p.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 px-3 py-2 rounded-lg"
          style={{ background: '#0d1117', border: '1px solid #1d3a2a' }}>
          <div className="text-xs" style={{ color: '#5a7a6a' }}>
            Total moves: {moveLog.filter(m => m.type === 'play').length} words played
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button onClick={handlePlayAgain}
            className="py-3 rounded-xl text-base font-semibold tracking-wider transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1a4a2a, #2d6a3e)',
              color: '#e8dcc8',
              border: '1px solid #3d8a5a',
            }}>
            Play Again
          </button>
          <button onClick={handlePlayAgain}
            className="py-2 rounded-lg text-sm"
            style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
