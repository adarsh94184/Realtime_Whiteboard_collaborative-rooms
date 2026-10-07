import React, { createContext, useContext, useState, useCallback } from 'react';

const WhiteboardContext = createContext();

export const WhiteboardProvider = ({ children }) => {
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [strokePattern, setStrokePattern] = useState('solid'); // solid, dashed, dotted
  const [fontSize, setFontSize] = useState(20);

  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setRoomTitle] = useState('Untitled Whiteboard');
  const [activeUsers, setActiveUsers] = useState([]);
  const [peerCursors, setPeerCursors] = useState({});

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Helper zoom functions
  const zoomIn = useCallback(() => setZoom(z => Math.min(z * 1.2, 5)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z / 1.2, 0.15)), []);
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  return (
    <WhiteboardContext.Provider
      value={{
        selectedTool, setSelectedTool,
        strokeColor, setStrokeColor,
        fillColor, setFillColor,
        strokeWidth, setStrokeWidth,
        opacity, setOpacity,
        strokePattern, setStrokePattern,
        fontSize, setFontSize,
        elements, setElements,
        selectedElementId, setSelectedElementId,
        zoom, setZoom, zoomIn, zoomOut, resetZoom,
        panOffset, setPanOffset,
        roomId, setRoomId,
        roomTitle, setRoomTitle,
        activeUsers, setActiveUsers,
        peerCursors, setPeerCursors,
        chatMessages, setChatMessages,
        isChatOpen, setIsChatOpen,
        canUndo, setCanUndo,
        canRedo, setCanRedo
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => useContext(WhiteboardContext);
