import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Navigation, Pencil, Eraser, MoveRight, Square, Circle, Type } from 'lucide-react';

export const LiveCursors = () => {
  const { peerCursors } = useWhiteboard();

  return (
    <>
      {Object.entries(peerCursors).map(([socketId, cursor]) => {
        if (!cursor || !cursor.user) return null;

        const { user, x, y, selectedTool, isDrawing } = cursor;

        return (
          <div
            key={socketId}
            className="user-cursor"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`
            }}
          >
            {/* Custom SVG Pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={user.avatarColor || '#6366f1'}
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            >
              <path d="M5.5 3.21l12.44 12.44a.75.75 0 0 1-.53 1.28H12.4l3.1 6.2a.75.75 0 0 1-1.34.67l-3.1-6.2-4.14 4.14a.75.75 0 0 1-1.28-.53V3.74a.75.75 0 0 1 .86-.53z" />
            </svg>

            {/* Name & Tool Badge */}
            <div
              className="cursor-badge"
              style={{ backgroundColor: user.avatarColor || '#6366f1' }}
            >
              <span>{user.username}</span>
              {isDrawing && <span style={{ fontStyle: 'italic', opacity: 0.9 }}> drawing...</span>}
            </div>
          </div>
        );
      })}
    </>
  );
};
