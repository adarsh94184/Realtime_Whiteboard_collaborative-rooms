import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { drawElement, drawSelectionBox, getElementBounds, isPointInElement } from '../utils/canvasUtils';

const generateId = () => 'el_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

export const WhiteboardCanvas = ({
  emitDrawStream,
  emitElementCreate,
  emitElementUpdate,
  emitElementDelete,
  emitCursorMove
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const {
    selectedTool,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    strokePattern,
    fontSize,
    elements, setElements,
    selectedElementId, setSelectedElementId,
    zoom, setZoom,
    panOffset, setPanOffset
  } = useWhiteboard();

  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Inline text editing state
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, text: '', elementId: null });

  // Helper to translate Screen Mouse Coordinates -> Canvas World Coordinates
  const getCanvasWorldCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    // Apply Inverse Pan & Zoom
    const worldX = (screenX - panOffset.x) / zoom;
    const worldY = (screenY - panOffset.y) / zoom;

    return { x: worldX, y: worldY };
  }, [zoom, panOffset]);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply DPR & World Pan/Zoom Transformation
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw Canvas Grid Background Pattern
    const gridSize = 40;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const startX = Math.floor(-panOffset.x / zoom / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-panOffset.y / zoom / gridSize) * gridSize - gridSize;
    const endX = startX + (canvas.width / dpr / zoom) + gridSize * 2;
    const endY = startY + (canvas.height / dpr / zoom) + gridSize * 2;

    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    ctx.restore();

    // 1. Draw all stored elements
    elements.forEach(el => {
      drawElement(ctx, el);
    });

    // 2. Draw currently active drawing element
    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    // 3. Draw Selection Box on active element
    if (selectedElementId) {
      const selEl = elements.find(el => el.id === selectedElementId);
      if (selEl) {
        drawSelectionBox(ctx, selEl);
      }
    }

    ctx.restore();
  }, [elements, currentElement, selectedElementId, zoom, panOffset]);

  // Window Resize & High DPI Canvas Setup
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      renderCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Wheel Pan & Zoom Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom(z => Math.max(0.15, Math.min(5, z * zoomFactor)));
      } else {
        // Pan
        setPanOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [setZoom, setPanOffset]);

  // Mouse / Touch Start Handler
  const handlePointerDown = (e) => {
    if (e.button === 1 || selectedTool === 'pan') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = getCanvasWorldCoords(e);

    if (selectedTool === 'select') {
      // Find top-most element under cursor
      const clickedEl = [...elements].reverse().find(el => isPointInElement(x, y, el));
      if (clickedEl) {
        setSelectedElementId(clickedEl.id);
        setDraggedElement(clickedEl);
        setDragOffset({ x: x - clickedEl.x, y: y - clickedEl.y });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    if (selectedTool === 'eraser') {
      // Delete elements under eraser
      const toDelete = elements.filter(el => isPointInElement(x, y, el)).map(el => el.id);
      if (toDelete.length > 0) {
        setElements(prev => prev.filter(el => !toDelete.includes(el.id)));
        emitElementDelete(toDelete);
      }
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    const newId = generateId();

    if (selectedTool === 'pencil') {
      const newEl = {
        id: newId,
        type: 'pencil',
        points: [{ x, y }],
        strokeColor,
        strokeWidth,
        opacity,
        strokePattern
      };
      setCurrentElement(newEl);
    } else if (selectedTool === 'line' || selectedTool === 'arrow' || selectedTool === 'rectangle' || selectedTool === 'circle') {
      const newEl = {
        id: newId,
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        strokeColor,
        fillColor,
        strokeWidth,
        opacity,
        strokePattern
      };
      setCurrentElement(newEl);
    } else if (selectedTool === 'text') {
      setTextInput({ visible: true, x: e.clientX, y: e.clientY, text: '', worldX: x, worldY: y, elementId: newId });
      setIsDrawing(false);
    } else if (selectedTool === 'sticky') {
      const newEl = {
        id: newId,
        type: 'sticky',
        x,
        y,
        width: 160,
        height: 140,
        fillColor: fillColor !== 'transparent' ? fillColor : '#fef08a',
        text: 'New Note',
        opacity
      };
      setElements(prev => [...prev, newEl]);
      emitElementCreate(newEl);
      setSelectedElementId(newId);
      setIsDrawing(false);
    }
  };

  // Mouse / Touch Move Handler
  const handlePointerMove = (e) => {
    const { x, y } = getCanvasWorldCoords(e);

    // Throttle live cursor broadcast
    emitCursorMove({ x: e.clientX, y: e.clientY, selectedTool, isDrawing });

    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }

    if (draggedElement) {
      const updated = {
        ...draggedElement,
        x: x - dragOffset.x,
        y: y - dragOffset.y
      };
      setDraggedElement(updated);
      setElements(prev => prev.map(el => el.id === updated.id ? updated : el));
      emitElementUpdate(updated);
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (currentElement.type === 'pencil') {
      const updatedPoints = [...currentElement.points, { x, y }];
      const updated = { ...currentElement, points: updatedPoints };
      setCurrentElement(updated);
      emitDrawStream({ point: { x, y }, elementId: currentElement.id, strokeColor, strokeWidth });
    } else if (['line', 'arrow', 'rectangle', 'circle'].includes(currentElement.type)) {
      const updated = {
        ...currentElement,
        width: x - currentElement.x,
        height: y - currentElement.y
      };
      setCurrentElement(updated);
    }
  };

  // Mouse / Touch Up Handler
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggedElement) {
      setDraggedElement(null);
    }

    if (isDrawing && currentElement) {
      setIsDrawing(false);
      setElements(prev => [...prev, currentElement]);
      emitElementCreate(currentElement);
      setCurrentElement(null);
    }
  };

  // Handle Image Asset Upload
  const handleAddImage = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const worldX = (window.innerWidth / 2 - panOffset.x) / zoom - 150;
      const worldY = (window.innerHeight / 2 - panOffset.y) / zoom - 150;
      const newEl = {
        id: generateId(),
        type: 'image',
        x: worldX,
        y: worldY,
        width: 300,
        height: (img.height / img.width) * 300 || 200,
        imageSrc,
        imageObj: img
      };
      setElements(prev => [...prev, newEl]);
      emitElementCreate(newEl);
      setSelectedElementId(newEl.id);
    };
  };

  // Keyboard Shortcuts (Delete, Escape, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        emitElementDelete([selectedElementId]);
        setSelectedElementId(null);
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, setElements, emitElementDelete, setSelectedElementId]);

  // Submit Text overlay element
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.text.trim()) {
      const newEl = {
        id: textInput.elementId,
        type: 'text',
        x: textInput.worldX,
        y: textInput.worldY,
        text: textInput.text,
        strokeColor,
        fontSize: fontSize || 22,
        opacity
      };
      setElements(prev => [...prev, newEl]);
      emitElementCreate(newEl);
    }
    setTextInput({ visible: false, x: 0, y: 0, text: '', elementId: null });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: selectedTool === 'pan' || isPanning ? 'grab' : selectedTool === 'select' ? 'default' : 'crosshair'
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <canvas ref={canvasRef} />

      {/* Inline Text Overlay */}
      {textInput.visible && (
        <form
          onSubmit={handleTextSubmit}
          style={{
            position: 'absolute',
            left: `${textInput.x}px`,
            top: `${textInput.y}px`,
            zIndex: 90
          }}
        >
          <input
            type="text"
            autoFocus
            className="glass-input"
            value={textInput.text}
            onChange={(e) => setTextInput(prev => ({ ...prev, text: e.target.value }))}
            onBlur={handleTextSubmit}
            placeholder="Type text here..."
            style={{
              color: strokeColor,
              fontSize: `${(fontSize || 22) * zoom}px`,
              background: 'rgba(15, 23, 42, 0.9)',
              minWidth: '150px'
            }}
          />
        </form>
      )}
    </div>
  );
};
