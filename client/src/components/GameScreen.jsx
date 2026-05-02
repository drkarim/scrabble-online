import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useGameStore } from '../hooks/useGameState';
import Board from './Board';
import TileRack from './TileRack';
import ScoreBoard from './ScoreBoard';
import MoveLog from './MoveLog';
import { StaticTile } from './Tile';

function BlankDialog({ onClose, onSelect }) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl p-6 w-80"
        style={{ background: '#111820', border: '1px solid #3d6a4a' }}>
        <h3 className="text-lg font-cinzel text-center mb-4" style={{ color: '#c8a46e' }}>
          Choose Letter for Blank Tile
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {letters.map(l => (
            <button key={l}
              onClick={() => onSelect(l)}
              className="w-8 h-8 rounded text-sm font-bold transition-all hover:scale-110"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #faebd7 0%, #f5deb3 40%, #d4b483 100%)',
                color: '#2c1810',
                border: '1px solid #b8860b',
                fontFamily: '"IM Fell English", serif',
              }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={onClose}
          className="w-full py-2 rounded-lg text-sm"
          style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ExchangeDialog({ rack, onClose, onExchange }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl p-6 w-80"
        style={{ background: '#111820', border: '1px solid #3d6a4a' }}>
        <h3 className="text-lg font-cinzel text-center mb-2" style={{ color: '#c8a46e' }}>
          Exchange Tiles
        </h3>
        <p className="text-xs text-center mb-4" style={{ color: '#5a8a6a' }}>
          Select tiles to exchange (costs your turn)
        </p>
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {rack.map(tile => (
            <div key={tile.id}
              onClick={() => toggle(tile.id)}
              className="cursor-pointer transition-all"
              style={{
                transform: selected.includes(tile.id) ? 'translateY(-4px)' : undefined,
                opacity: selected.includes(tile.id) ? 1 : 0.6,
              }}>
              <StaticTile tile={tile} size="md" />
            </div>
          ))}
        </div>
        <div className="text-center text-sm mb-4" style={{ color: '#5a8a6a' }}>
          {selected.length} tile{selected.length !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm"
            style={{ background: '#1a2530', color: '#7a9a8a', border: '1px solid #2d3a4a' }}>
            Cancel
          </button>
          <button
            disabled={selected.length === 0}
            onClick={() => onExchange(selected)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ background: '#1a4a2a', color: '#e8dcc8', border: '1px solid #3d8a5a' }}>
            Exchange
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GameScreen({ emit }) {
  const {
    board, players, currentPlayerId, playerId, rack,
    pendingPlacements, selectedTileId,
    placeTile, recallTiles, setSelectedTile, setBlankLetter,
    lastMoveResult, clearLastMoveResult,
  } = useGameStore();

  const [activeDrag, setActiveDrag] = useState(null);
  const [blankDialog, setBlankDialog] = useState(null); // { tileId, row, col }
  const [showExchange, setShowExchange] = useState(false);
  const [previewScore, setPreviewScore] = useState(null);
  const [notification, setNotification] = useState(null);

  const isMyTurn = currentPlayerId === playerId;
  const me = players.find(p => p.id === playerId);
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // Show notification for move results
  useEffect(() => {
    if (!lastMoveResult) return;
    if (lastMoveResult.type === 'valid') {
      setNotification({
        type: 'success',
        msg: `+${lastMoveResult.score} pts — ${lastMoveResult.words.join(', ')}`,
      });
    } else if (lastMoveResult.type === 'invalid') {
      setNotification({ type: 'error', msg: lastMoveResult.reason });
    }
    const t = setTimeout(() => {
      setNotification(null);
      clearLastMoveResult();
    }, 3000);
    return () => clearTimeout(t);
  }, [lastMoveResult]);

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (active.data.current?.tile) {
      setActiveDrag(active.data.current.tile);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over || !isMyTurn) return;

    const tile = active.data.current?.tile;
    if (!tile) return;

    const overId = over.id;

    // Dropped on a board cell
    if (overId.startsWith('cell-')) {
      const [, rowStr, colStr] = overId.split('-');
      const row = parseInt(rowStr);
      const col = parseInt(colStr);

      if (tile.isBlank) {
        setBlankDialog({ tileId: tile.id, row, col });
      } else {
        placeTile(tile.id, row, col);
      }
    }
    // Dropped back on rack — do nothing (tile stays in rack if not placed)
  }, [isMyTurn, placeTile]);

  const handleCellClick = useCallback((row, col) => {
    if (!isMyTurn || !selectedTileId) return;
    const tile = rack.find(t => t.id === selectedTileId);
    if (!tile) return;

    if (tile.isBlank) {
      setBlankDialog({ tileId: tile.id, row, col });
    } else {
      placeTile(tile.id, row, col);
    }
  }, [isMyTurn, selectedTileId, rack, placeTile]);

  const handleBlankSelect = (letter) => {
    if (blankDialog) {
      placeTile(blankDialog.tileId, blankDialog.row, blankDialog.col);
      // Set blank letter after placement
      setTimeout(() => {
        setBlankLetter(blankDialog.tileId, letter);
      }, 0);
      setBlankDialog(null);
    }
  };

  const handlePlayWord = () => {
    if (pendingPlacements.length === 0 || !isMyTurn) return;
    emit('game:placeTiles', { placements: pendingPlacements });
  };

  const handlePass = () => {
    if (!isMyTurn) return;
    recallTiles();
    emit('game:pass');
  };

  const handleExchange = (tileIds) => {
    setShowExchange(false);
    if (!isMyTurn) return;
    recallTiles();
    emit('game:exchangeTiles', { tileIds });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: '#0a0f0d', borderBottom: '1px solid #1d3a2a' }}>
        <span className="text-lg font-cinzel font-bold tracking-widest hidden sm:block"
          style={{ color: '#c8a46e' }}>
          SCRABBLE
        </span>
        <ScoreBoard />
        <div className="text-xs hidden sm:block" style={{ color: '#3d5a4a' }}>
          {currentPlayer?.name}'s turn
        </div>
      </div>

      {/* Turn indicator */}
      {isMyTurn && (
        <div className="text-center py-1 text-xs font-semibold"
          style={{ background: '#0f2018', color: '#5aaa6a', borderBottom: '1px solid #1d4a2a' }}>
          Your turn!
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-semibold slide-in"
          style={{
            background: notification.type === 'success' ? '#1a3a1a' : '#3a1a1a',
            color: notification.type === 'success' ? '#5aaa6a' : '#ff7a7a',
            border: `1px solid ${notification.type === 'success' ? '#3d8a5a' : '#8a3a3a'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}>
          {notification.msg}
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board area */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-auto px-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Board onCellClick={handleCellClick} />

            {/* Tile Rack */}
            <div className="w-full mt-2">
              <TileRack isMyTurn={isMyTurn} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2 pb-4 flex-wrap justify-center px-2">
              <button
                onClick={handlePlayWord}
                disabled={!isMyTurn || pendingPlacements.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #1a4a2a, #2d6a3e)',
                  color: '#e8dcc8',
                  border: '1px solid #3d8a5a',
                }}>
                Play Word {pendingPlacements.length > 0 ? `(${pendingPlacements.length})` : ''}
              </button>
              <button
                onClick={recallTiles}
                disabled={pendingPlacements.length === 0}
                className="px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
                style={{ background: '#1a2530', color: '#a0b0a0', border: '1px solid #2d3a4a' }}>
                Recall
              </button>
              <button
                onClick={() => setShowExchange(true)}
                disabled={!isMyTurn || pendingPlacements.length > 0}
                className="px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
                style={{ background: '#1a2a3a', color: '#a0b0c0', border: '1px solid #2d3a5a' }}>
                Exchange
              </button>
              <button
                onClick={handlePass}
                disabled={!isMyTurn}
                className="px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
                style={{ background: '#2a1a1a', color: '#c07070', border: '1px solid #5a2a2a' }}>
                Pass
              </button>
            </div>

            <DragOverlay>
              {activeDrag && <StaticTile tile={activeDrag} size="md" />}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Side panel */}
        <div className="hidden lg:flex flex-col p-3 gap-3 shrink-0" style={{ width: 200 }}>
          <MoveLog />
        </div>
      </div>

      {/* Blank tile dialog */}
      {blankDialog && (
        <BlankDialog
          onClose={() => setBlankDialog(null)}
          onSelect={handleBlankSelect}
        />
      )}

      {/* Exchange dialog */}
      {showExchange && (
        <ExchangeDialog
          rack={rack}
          onClose={() => setShowExchange(false)}
          onExchange={handleExchange}
        />
      )}
    </div>
  );
}
