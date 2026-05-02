import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function Tile({ tile, isUncommitted = false, isSelected = false, onClick, size = 'md', dragData = {} }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id,
    data: { tile, ...dragData },
    disabled: !tile,
  });

  const sizeMap = {
    sm: { outer: 28, font: 13, sub: 7 },
    md: { outer: 40, font: 18, sub: 9 },
    lg: { outer: 52, font: 22, sub: 11 },
  };
  const s = sizeMap[size] || sizeMap.md;

  const style = {
    width: s.outer,
    height: s.outer,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 1000 : undefined,
    touchAction: 'none',
  };

  const letter = tile.isBlank && tile.blankLetter ? tile.blankLetter : tile.letter;
  const displayLetter = tile.isBlank && !tile.blankLetter ? '?' : letter;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`scrabble-tile flex items-center justify-center relative ${isDragging ? 'is-dragging' : ''} ${isUncommitted ? 'uncommitted' : ''} ${isSelected ? 'selected' : ''}`}
      style={style}
      title={tile.isBlank ? 'Blank tile' : `${letter} (${tile.value}pts)`}
    >
      <span style={{
        fontFamily: '"IM Fell English", "Playfair Display", serif',
        fontSize: s.font,
        fontWeight: 'bold',
        color: '#2c1810',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {displayLetter}
      </span>
      {tile.value !== undefined && !tile.isBlank && (
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 3,
          fontSize: s.sub,
          color: '#5a3a1a',
          fontWeight: 'bold',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {tile.value}
        </span>
      )}
      {tile.isBlank && tile.blankLetter && (
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 3,
          fontSize: s.sub,
          color: '#8a6a4a',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          0
        </span>
      )}
    </div>
  );
}

// Static (non-draggable) tile for the board
export function StaticTile({ tile, isUncommitted = false, size = 'md', animClassName = '', animStyle = {} }) {
  const sizeMap = {
    sm: { outer: 28, font: 13, sub: 7 },
    md: { outer: 40, font: 18, sub: 9 },
    lg: { outer: 52, font: 22, sub: 11 },
  };
  const s = sizeMap[size] || sizeMap.md;

  const displayLetter = tile.isBlank ? (tile.blankLetter || tile.letter || '?') : tile.letter;

  return (
    <div
      className={`scrabble-tile flex items-center justify-center relative ${isUncommitted ? 'uncommitted' : ''} ${animClassName}`}
      style={{ width: s.outer, height: s.outer, ...animStyle }}
    >
      <span style={{
        fontFamily: '"IM Fell English", "Playfair Display", serif',
        fontSize: s.font,
        fontWeight: 'bold',
        color: '#2c1810',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {displayLetter}
      </span>
      {!tile.isBlank && tile.value !== undefined && (
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 3,
          fontSize: s.sub,
          color: '#5a3a1a',
          fontWeight: 'bold',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {tile.value}
        </span>
      )}
      {tile.isBlank && (
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 3,
          fontSize: s.sub,
          color: '#8a6a4a',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          0
        </span>
      )}
    </div>
  );
}
