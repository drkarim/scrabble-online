import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../hooks/useGameState';

export default function MoveLog() {
  const { moveLog } = useGameStore();
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moveLog.length]);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: '#111820', border: '1px solid #2d3a4a', minWidth: 180 }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{ background: '#0d1117', borderBottom: '1px solid #2d3a4a' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a8a6a' }}>
          Move Log
        </span>
        <span style={{ color: '#5a8a6a', fontSize: 12 }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div className="overflow-y-auto" style={{ maxHeight: 220, minHeight: 60 }}>
          {moveLog.length === 0 ? (
            <div className="px-3 py-4 text-xs text-center" style={{ color: '#3d5a4a' }}>
              No moves yet
            </div>
          ) : (
            <div className="flex flex-col">
              {moveLog.map((entry, i) => (
                <div key={i} className="px-3 py-1.5 text-xs slide-in"
                  style={{ borderBottom: '1px solid #1a2530' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#c8a46e', fontWeight: 600 }}>
                      {entry.playerName}
                    </span>
                    {entry.type === 'play' && (
                      <span style={{ color: '#5aaa6a', fontWeight: 700 }}>
                        +{entry.score}
                      </span>
                    )}
                  </div>
                  {entry.type === 'play' && entry.words && (
                    <div style={{ color: '#a0b0a0' }}>
                      {entry.words.join(', ')}
                    </div>
                  )}
                  {entry.type === 'exchange' && (
                    <div style={{ color: '#7a8a9a' }}>exchanged {entry.count} tile{entry.count !== 1 ? 's' : ''}</div>
                  )}
                  {entry.type === 'pass' && (
                    <div style={{ color: '#7a8a9a' }}>passed</div>
                  )}
                  {entry.totalScore !== undefined && (
                    <div style={{ color: '#4a6a5a', fontSize: 10 }}>
                      Total: {entry.totalScore}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
