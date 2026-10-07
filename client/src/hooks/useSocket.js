import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useWhiteboard } from '../context/WhiteboardContext';
import { useAuth } from '../context/AuthContext';

export const useSocket = (targetRoomId) => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const {
    setElements,
    setRoomTitle,
    setActiveUsers,
    setPeerCursors,
    setChatMessages,
    setCanUndo,
    setCanRedo
  } = useWhiteboard();

  useEffect(() => {
    if (!targetRoomId) return;

    // Connect socket
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
      socket.emit('join-room', { roomId: targetRoomId, user });
    });

    socket.on(
      'init-board-state',
      ({ title, elements, activeUsers, chatMessages }) => {
        setRoomTitle(title);
        setElements(elements || []);
        setActiveUsers(activeUsers || []);

        // Restore previous chat history
        setChatMessages(chatMessages || []);

        setCanUndo(elements && elements.length > 0);
      }
    );

    socket.on('user-joined', ({ user: joinedUser, activeUsers }) => {
      setActiveUsers(activeUsers || []);
    });

    socket.on('user-left', ({ socketId, activeUsers }) => {
      setActiveUsers(activeUsers || []);
      setPeerCursors(prev => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    socket.on('element-created', ({ element }) => {
      setElements(prev => {
        // Prevent duplicate element if local optimistic update already added it
        const exists = prev.some(el => el.id === element.id);
        if (exists) return prev;
        return [...prev, element];
      });
      setCanUndo(true);
    });

    socket.on('element-updated', ({ element }) => {
      setElements(prev => prev.map(el => el.id === element.id ? { ...el, ...element } : el));
    });

    socket.on('element-deleted', ({ elementIds }) => {
      setElements(prev => prev.filter(el => !elementIds.includes(el.id)));
    });

    socket.on('board-cleared', () => {
      setElements([]);
    });

    socket.on('cursor-moved', ({ socketId, user: peerUser, x, y, selectedTool, isDrawing }) => {
      setPeerCursors(prev => ({
        ...prev,
        [socketId]: { user: peerUser, x, y, selectedTool, isDrawing, lastActive: Date.now() }
      }));
    });

    socket.on('board-synced', ({ elements }) => {
      setElements(elements || []);
    });

    socket.on('chat-received', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      console.log('Disconnecting socket room:', targetRoomId);
      socket.disconnect();
    };
  }, [targetRoomId, user, setElements, setRoomTitle, setActiveUsers, setPeerCursors, setChatMessages, setCanUndo]);

  // Emitter helpers
  const emitDrawStream = useCallback((pointData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('draw-stream', pointData);
    }
  }, []);

  const emitElementCreate = useCallback((element) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-create', { element });
    }
  }, []);

  const emitElementUpdate = useCallback((element) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-update', { element });
    }
  }, []);

  const emitElementDelete = useCallback((elementIds) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-delete', { elementIds });
    }
  }, []);

  const emitBoardClear = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('board-clear');
    }
  }, []);

  const emitCursorMove = useCallback((cursorData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursor-move', cursorData);
    }
  }, []);

  const emitUndo = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('undo');
    }
  }, []);

  const emitRedo = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('redo');
    }
  }, []);

  const emitSendChat = useCallback((text) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send-chat', { text });
    }
  }, []);

  return {
    socket: socketRef.current,
    emitDrawStream,
    emitElementCreate,
    emitElementUpdate,
    emitElementDelete,
    emitBoardClear,
    emitCursorMove,
    emitUndo,
    emitRedo,
    emitSendChat
  };
};
