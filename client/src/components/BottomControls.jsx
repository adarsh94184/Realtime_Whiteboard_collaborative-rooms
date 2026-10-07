import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, RotateCw } from 'lucide-react';

export const BottomControls = ({ onUndo, onRedo }) => {
  const { zoom, zoomIn, zoomOut, resetZoom, canUndo, canRedo } = useWhiteboard();

  return (
    <div className="bottom-controls glass-panel">
      {/* Undo / Redo */}
      <button className="glass-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
        <RotateCcw size={16} />
      </button>

      <button className="glass-btn" onClick={onRedo} title="Redo (Ctrl+Y)">
        <RotateCw size={16} />
      </button>

      <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }} />

      {/* Zoom Controls */}
      <button className="glass-btn" onClick={zoomOut} title="Zoom Out">
        <ZoomOut size={16} />
      </button>

      <button
        className="glass-btn"
        onClick={resetZoom}
        style={{ minWidth: '60px', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
        title="Reset Zoom (100%)"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button className="glass-btn" onClick={zoomIn} title="Zoom In">
        <ZoomIn size={16} />
      </button>

      <button className="glass-btn" onClick={resetZoom} title="Fit to Screen">
        <Maximize2 size={16} />
      </button>
    </div>
  );
};
