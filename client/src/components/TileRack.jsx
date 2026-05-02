import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Tile } from './Tile';
import { useGameStore } from '../hooks/useGameState';

function RackSlot({ index, tile, selectedTileId, onTileClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `rack-slot-${index}`,
    data: { rackIndex: index },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center justify-center rounded-sm"
      style={{
        width: 44,
        height: 48,
        background: isOver
          ? 'rgba(200,164,110,0.2)'
          : 'linear-gradient(180deg, #1a0e06 0%, #120906 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
        transition: 'background 0.15s',
      }}
    >
      {tile && (
        <Tile
          tile={tile}
          isSelected={selectedTileId === tile.id}
          onClick={() => onTileClick(tile.id)}
          size="md"
        />
      )}
    </div>
  );
}

export default function TileRack({ isMyTurn }) {
  const { rack, selectedTileId, setSelectedTile } = useGameStore();

  const handleTileClick = (tileId) => {
    setSelectedTile(selectedTileId === tileId ? null : tileId);
  };

  return (
    <div className="tile-rack px-4 py-3">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: 7 }, (_, i) => (
          <RackSlot
            key={i}
            index={i}
            tile={rack[i]}
            selectedTileId={selectedTileId}
            onTileClick={handleTileClick}
          />
        ))}
      </div>
      {!isMyTurn && (
        <div className="text-center mt-1 text-xs" style={{ color: '#3d5a4a' }}>
          Waiting for your turn...
        </div>
      )}
    </div>
  );
}
