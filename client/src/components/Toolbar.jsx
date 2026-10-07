import React, { useRef } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import {
  Pencil,
  Eraser,
  Minus,
  MoveRight,
  Square,
  Circle,
  Type,
  StickyNote,
  Image as ImageIcon,
  MousePointer,
  Hand,
  Trash2
} from 'lucide-react';

export const Toolbar = ({ onClearBoard, onImageUpload }) => {
  const { selectedTool, setSelectedTool } = useWhiteboard();
  const fileInputRef = useRef(null);

  const tools = [
    { id: 'select', label: 'Select / Move (V)', icon: MousePointer },
    { id: 'pencil', label: 'Pencil (P)', icon: Pencil },
    { id: 'eraser', label: 'Eraser (E)', icon: Eraser },
    { id: 'line', label: 'Line (L)', icon: Minus },
    { id: 'arrow', label: 'Arrow (A)', icon: MoveRight },
    { id: 'rectangle', label: 'Rectangle (R)', icon: Square },
    { id: 'circle', label: 'Circle (C)', icon: Circle },
    { id: 'text', label: 'Text (T)', icon: Type },
    { id: 'sticky', label: 'Sticky Note (S)', icon: StickyNote },
    { id: 'image', label: 'Image Upload', icon: ImageIcon },
    { id: 'pan', label: 'Pan Canvas (H)', icon: Hand },
  ];

  const handleToolClick = (toolId) => {
    if (toolId === 'image') {
      fileInputRef.current?.click();
    } else {
      setSelectedTool(toolId);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && onImageUpload) {
          onImageUpload(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="toolbar-container glass-panel">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = selectedTool === t.id;
        return (
          <button
            key={t.id}
            className={`tool-item ${isActive ? 'active' : ''}`}
            onClick={() => handleToolClick(t.id)}
            title={t.label}
          >
            <Icon size={20} />
          </button>
        );
      })}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div style={{ width: '28px', height: '1px', background: 'var(--border-color)', margin: '4px auto' }} />

      <button
        className="tool-item"
        style={{ color: '#ef4444' }}
        onClick={onClearBoard}
        title="Clear Whiteboard"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};
