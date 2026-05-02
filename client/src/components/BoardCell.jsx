import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { getSquareType, SQUARE_COLORS } from '../utils/boardLayout';
import { Tile, StaticTile } from './Tile';

export default function BoardCell({ row, col, tile, pendingTile, onCellClick, onPendingTileClick, cellSize }) {
  const squareType = getSquareType(row, col);
  const isCenter = row === 7 && col === 7;

  // Only allow drops on empty cells (no committed tile, no pending tile)
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${col}`,
    data: { row, col },
    disabled: !!(tile || pendingTile),
  });

  const sqColors = squareType ? SQUARE_COLORS[squareType] : null;
  const sz = cellSize || 40;

  let bgStyle = {};
  if (!tile && !pendingTile && sqColors) {
    bgStyle = { background: sqColors.bg };
  }

  return (
    <div
      ref={setNodeRef}
      className={`board-cell flex items-center justify-center relative ${squareType ? `sq-${squareType.toLowerCase()}` : ''}`}
      style={{
        width: sz,
        height: sz,
        ...bgStyle,
        outline: isOver ? '2px solid #c8a46e' : undefined,
        cursor: pendingTile ? 'pointer' : tile ? 'default' : 'pointer',
      }}
      onClick={() => {
        if (pendingTile) {
          onPendingTileClick?.(row, col);
        } else if (!tile) {
          onCellClick?.(row, col);
        }
      }}
    >
      {tile && !pendingTile && (
        <StaticTile tile={tile} size={sz >= 44 ? 'md' : 'sm'} />
      )}

      {pendingTile && (
        <div title="Click to return to rack, or drag to another square">
          <Tile
            tile={{ ...pendingTile, id: pendingTile.tileId }}
            isUncommitted={true}
            dragData={{ source: 'board', fromRow: row, fromCol: col }}
            size={sz >= 44 ? 'md' : 'sm'}
          />
        </div>
      )}

      {!tile && !pendingTile && (
        <div className="flex flex-col items-center justify-center text-center" style={{ pointerEvents: 'none' }}>
          {isCenter && (
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
