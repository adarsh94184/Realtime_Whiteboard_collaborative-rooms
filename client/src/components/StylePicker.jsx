import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Palette, Sliders, Layers } from 'lucide-react';

const PALETTE_COLORS = [
  '#ffffff', // White
  '#000000', // Black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
];

const STICKY_COLORS = [
  '#fef08a', // Yellow
  '#bbf7d0', // Green
  '#bfdbfe', // Blue
  '#fbcfe8', // Pink
  '#fed7aa', // Orange
];

export const StylePicker = () => {
  const {
    selectedTool,
    strokeColor, setStrokeColor,
    fillColor, setFillColor,
    strokeWidth, setStrokeWidth,
    opacity, setOpacity,
    strokePattern, setStrokePattern
  } = useWhiteboard();

  const [expanded, setExpanded] = useState(true);

  if (selectedTool === 'pan' || selectedTool === 'eraser') return null;

  return (
    <div className="stylebar-container glass-panel">
      {/* Stroke Color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Palette size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stroke:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {PALETTE_COLORS.slice(0, 7).map(c => (
            <div
              key={c}
              className={`color-swatch ${strokeColor === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setStrokeColor(c)}
            />
          ))}
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: 'none'
            }}
            title="Custom stroke color"
          />
        </div>
      </div>

      <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }} />

      {/* Fill Color */}
      {(selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'sticky') && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Fill:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                className={`color-swatch ${fillColor === 'transparent' ? 'active' : ''}`}
                style={{
                  background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
                onClick={() => setFillColor('transparent')}
                title="Transparent fill"
              />
              {(selectedTool === 'sticky' ? STICKY_COLORS : PALETTE_COLORS.slice(0, 5)).map(c => (
                <div
                  key={c}
                  className={`color-swatch ${fillColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFillColor(c)}
                />
              ))}
            </div>
          </div>
          <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }} />
        </>
      )}

      {/* Stroke Width */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Size:</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[2, 4, 8, 14].map(w => (
            <button
              key={w}
              className={`glass-btn ${strokeWidth === w ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: '28px', justifyContent: 'center' }}
              onClick={() => setStrokeWidth(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }} />

      {/* Stroke Pattern */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {['solid', 'dashed', 'dotted'].map(pat => (
          <button
            key={pat}
            className={`glass-btn ${strokePattern === pat ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            onClick={() => setStrokePattern(pat)}
          >
            {pat}
          </button>
        ))}
      </div>
    </div>
  );
};
