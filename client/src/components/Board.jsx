import React, { useMemo } from 'react';
import BoardCell from './BoardCell';
import { COL_LABELS, BOARD_SIZE } from '../utils/boardLayout';
import { useGameStore } from '../hooks/useGameState';

export default function Board({ onCellClick, onPendingTileClick }) {
  const { board, pendingPlacements } = useGameStore();

  const pendingMap = useMemo(() => {
    const m = {};
    for (const p of pendingPlacements) {
      m[`${p.row},${p.col}`] = p;
    }
    return m;
  }, [pendingPlacements]);

  if (!board) return null;

  // Calculate responsive cell size
  const cellSize = typeof window !== 'undefined'
    ? Math.min(40, Math.floor((Math.min(window.innerWidth, 640) - 48) / 15))
    : 40;

  return (
    <div className="select-none">
      {/* Board wrapper with wooden border */}
      <div className="inline-block p-2 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #3a1f0a 0%, #2a1506 50%, #3a1f0a 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid #5a3a1a',
        }}>

        {/* Column labels */}
        <div className="flex ml-5 mb-0.5">
          {COL_LABELS.map(l => (
            <div key={l} style={{ width: cellSize, fontSize: 9, color: '#5a7a5a', textAlign: 'center' }}>
              {l}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row labels */}
          <div className="flex flex-col mr-0.5">
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <div key={i}
                style={{
                  width: 18,
                  height: cellSize,
                  fontSize: 9,
                  color: '#5a7a5a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 2,
                }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {Array.from({ length: BOARD_SIZE }, (_, row) =>
              Array.from({ length: BOARD_SIZE }, (_, col) => {
                const key = `${row},${col}`;
                const boardTile = board.grid?.[row]?.[col];
                const pending = pendingMap[key];
                return (
                  <BoardCell
                    key={key}
                    row={row}
                    col={col}
                    tile={boardTile}
                    pendingTile={pending}
                    onCellClick={onCellClick}
                    onPendingTileClick={onPendingTileClick}
                    cellSize={cellSize}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
