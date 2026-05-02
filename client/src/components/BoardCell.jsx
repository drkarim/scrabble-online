import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { getSquareType, SQUARE_COLORS } from '../utils/boardLayout';
import { StaticTile } from './Tile';

export default function BoardCell({ row, col, tile, pendingTile, onCellClick, cellSize }) {
  const squareType = getSquareType(row, col);
  const isCenter = row === 7 && col === 7;

  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${col}`,
    data: { row, col },
    disabled: !!(tile || pendingTile),
  });

  const sqColors = squareType ? SQUARE_COLORS[squareType] : null;

  let bgStyle = {};
  if (tile || pendingTile) {
    bgStyle = {};
  } else if (sqColors) {
    bgStyle = { background: sqColors.bg };
  }

  const sz = cellSize || 40;

  return (
    <div
      ref={setNodeRef}
      className={`board-cell flex items-center justify-center relative ${squareType ? `sq-${squareType.toLowerCase()}` : ''}`}
      style={{
        width: sz,
        height: sz,
        ...bgStyle,
        outline: isOver ? '2px solid #c8a46e' : undefined,
        cursor: (tile || pendingTile) ? 'default' : 'pointer',
      }}
      onClick={() => !tile && !pendingTile && onCellClick?.(row, col)}
    >
      {(tile || pendingTile) ? (
        <StaticTile
          tile={pendingTile || tile}
          isUncommitted={!!pendingTile}
          size={sz >= 44 ? 'md' : 'sm'}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center" style={{ pointerEvents: 'none' }}>
          {isCenter && !tile && !pendingTile && (
            <span style={{ color: sqColors?.text || '#c8a46e', fontSize: 16 }}>★</span>
          )}
          {squareType && !isCenter && (
            <span style={{
              color: sqColors?.text,
              fontSize: sz >= 40 ? 8 : 6,
              fontWeight: 'bold',
              letterSpacing: 0,
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
              {squareType}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
