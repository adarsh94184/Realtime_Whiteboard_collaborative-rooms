import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWhiteboard } from '../context/WhiteboardContext';
import { useSocket } from '../hooks/useSocket';
import { Navbar } from '../components/Navbar';
import { Toolbar } from '../components/Toolbar';
import { StylePicker } from '../components/StylePicker';
import { WhiteboardCanvas } from '../components/WhiteboardCanvas';
import { LiveCursors } from '../components/LiveCursors';
import { ChatPanel } from '../components/ChatPanel';
import { BottomControls } from '../components/BottomControls';
import { AuthModal } from '../components/AuthModal';
import { MyBoardsModal } from '../components/MyBoardsModal';

export const RoomPage = () => {
  const { roomId } = useParams();
  const { setRoomId } = useWhiteboard();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyBoardsOpen, setIsMyBoardsOpen] = useState(false);

  // Initialize Socket hooks for target roomId
  const {
    emitDrawStream,
    emitElementCreate,
    emitElementUpdate,
    emitElementDelete,
    emitBoardClear,
    emitCursorMove,
    emitUndo,
    emitRedo,
    emitSendChat
  } = useSocket(roomId);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId, setRoomId]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyBoards={() => setIsMyBoardsOpen(true)}
      />

      {/* Floating Toolbar */}
      <Toolbar
        onClearBoard={emitBoardClear}
        onImageUpload={(src) => {
          if (canvasRef.current) {
            canvasRef.current.handleAddImage(src);
          }
        }}
      />

      {/* Floating Style Picker */}
      <StylePicker />

      {/* Interactive Main Canvas */}
      <WhiteboardCanvas
        ref={canvasRef}
        emitDrawStream={emitDrawStream}
        emitElementCreate={emitElementCreate}
        emitElementUpdate={emitElementUpdate}
        emitElementDelete={emitElementDelete}
        emitCursorMove={emitCursorMove}
      />

      {/* Real-time Peer Cursor Overlay */}
      <LiveCursors />

      {/* Live Collaboration Chat Panel */}
      <ChatPanel onSendChat={emitSendChat} />

      {/* Bottom Controls (Zoom, Fit, Undo/Redo) */}
      <BottomControls
        onUndo={emitUndo}
        onRedo={emitRedo}
      />

      {/* Auth & My Boards Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MyBoardsModal isOpen={isMyBoardsOpen} onClose={() => setIsMyBoardsOpen(false)} />
    </div>
  );
};
