const Board = require('../models/Board');
const { memoryBoards, setMemoryBoard, getMemoryBoard } = require('../store/memoryStore');
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Tracks active users per room: roomId -> Map(socketId => userData)
const roomActiveUsers = new Map();

// Helper to save board state to MongoDB asynchronously with detailed logging
const saveBoardToDb = async (roomId) => {
  if (!isDbConnected()) {
    console.log(`[DB SAVE SKIPPED] MongoDB not connected`);
    return;
  }

  const board = getMemoryBoard(roomId);

  if (!board) {
    console.log(`[DB SAVE SKIPPED] No memory board for ${roomId}`);
    return;
  }

  try {
    console.log(
      `[DB SAVE] room=${roomId}, elements=${board.elements ? board.elements.length : 0}`
    );

    const savedBoard = await Board.findOneAndUpdate(
      { roomId },
      {
        elements: board.elements,
        chatMessages: board.chatMessages || [],
        title: board.title,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log(
      `[DB SAVE] Room ${roomId}: ${board.elements ? board.elements.length : 0} elements, ${board.chatMessages?.length || 0} messages`
    );

  } catch (err) {
    console.error(
      `[DB Persistence Error] Failed to persist room ${roomId}:`,
      err
    );
  }
};

// Debounce persistence map to prevent excessive DB writes
const saveTimeouts = new Map();
const scheduleBoardSave = (roomId) => {
  if (saveTimeouts.has(roomId)) {
    clearTimeout(saveTimeouts.get(roomId));
  }

  const timeout = setTimeout(async () => {
    await saveBoardToDb(roomId);
    saveTimeouts.delete(roomId);
  }, 1500);

  saveTimeouts.set(roomId, timeout);
};

const setupWhiteboardSocket = (io) => {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    console.log(`[Socket Connected] Socket ID: ${socket.id}`);

    // User joins a room
    socket.on('join-room', async ({ roomId, user }) => {
      currentRoomId = roomId;
      currentUser = {
        socketId: socket.id,
        id: user?.id || `guest_${socket.id.substring(0, 5)}`,
        username: user?.username || `Guest ${socket.id.substring(0, 4)}`,
        avatarColor: user?.avatarColor || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        isGuest: !user?.id
      };

      socket.join(roomId);

      // Manage active room users
      if (!roomActiveUsers.has(roomId)) {
        roomActiveUsers.set(roomId, new Map());
      }
      roomActiveUsers.get(roomId).set(socket.id, currentUser);

      // Fetch or initialize room board
      let board = getMemoryBoard(roomId);
      if (!board && isDbConnected()) {
        const dbBoard = await Board.findOne({ roomId });
        if (dbBoard) {
          board = dbBoard.toObject();
          setMemoryBoard(roomId, board);
        }
      }

      if (!board) {
        board = {
          roomId,
          title: `Board ${roomId}`,
          elements: [],
          chatMessages: [],
          undoStack: [],
          redoStack: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setMemoryBoard(roomId, board);
      }

      const activeUsersList = Array.from(roomActiveUsers.get(roomId).values());

      // Send initial board state to joining client
      socket.emit('init-board-state', {
        roomId,
        title: board.title,
        elements: board.elements || [],
        chatMessages: board.chatMessages || [],
        activeUsers: activeUsersList
      });

      // Broadcast join notification & updated user list to room
      socket.to(roomId).emit('user-joined', {
        user: currentUser,
        activeUsers: activeUsersList
      });

      console.log(`[Socket Room Join] User ${currentUser.username} joined room ${roomId}`);
    });

    // Realtime Drawing stroke streaming
    socket.on('draw-stream', (data) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('draw-stream', {
        ...data,
        socketId: socket.id
      });
    });

    // Create element
    socket.on('element-create', ({ element }) => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board) return;

      // Add to elements array
      board.elements.push(element);
      board.undoStack.push({ type: 'create', element });
      board.redoStack = []; // Reset redo on new action
      board.updatedAt = new Date();

      socket.to(currentRoomId).emit('element-created', { element, user: currentUser });
      scheduleBoardSave(currentRoomId);
    });

    // Update element
    socket.on('element-update', ({ element }) => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board) return;

      const idx = board.elements.findIndex(el => el.id === element.id);
      if (idx !== -1) {
        board.elements[idx] = { ...board.elements[idx], ...element, updatedAt: new Date() };
        board.updatedAt = new Date();

        socket.to(currentRoomId).emit('element-updated', { element, user: currentUser });
        scheduleBoardSave(currentRoomId);
      }
    });

    // Delete element(s)
    socket.on('element-delete', ({ elementIds }) => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board) return;

      const deleted = board.elements.filter(el => elementIds.includes(el.id));
      board.elements = board.elements.filter(el => !elementIds.includes(el.id));
      board.undoStack.push({ type: 'delete', elements: deleted });
      board.redoStack = [];
      board.updatedAt = new Date();

      io.to(currentRoomId).emit('element-deleted', { elementIds, user: currentUser });
      scheduleBoardSave(currentRoomId);
    });

    // Clear board
    socket.on('board-clear', () => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board) return;

      const oldElements = [...board.elements];
      board.elements = [];
      board.undoStack.push({ type: 'clear', elements: oldElements });
      board.redoStack = [];
      board.updatedAt = new Date();

      io.to(currentRoomId).emit('board-cleared', { user: currentUser });
      scheduleBoardSave(currentRoomId);
    });

    // Live Cursor position
    socket.on('cursor-move', (cursorData) => {
      if (!currentRoomId || !currentUser) return;

      socket.to(currentRoomId).emit('cursor-moved', {
        socketId: socket.id,
        user: currentUser,
        x: cursorData.x,
        y: cursorData.y,
        selectedTool: cursorData.selectedTool,
        isDrawing: cursorData.isDrawing
      });
    });

    // Undo action
    socket.on('undo', () => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board || board.elements.length === 0) return;

      // Pop last element
      const popped = board.elements.pop();
      if (popped) {
        board.redoStack.push(popped);
        board.updatedAt = new Date();
        io.to(currentRoomId).emit('board-synced', { elements: board.elements, action: 'undo' });
        scheduleBoardSave(currentRoomId);
      }
    });

    // Redo action
    socket.on('redo', () => {
      if (!currentRoomId) return;

      let board = getMemoryBoard(currentRoomId);
      if (!board || board.redoStack.length === 0) return;

      const restored = board.redoStack.pop();
      if (restored) {
        board.elements.push(restored);
        board.updatedAt = new Date();
        io.to(currentRoomId).emit('board-synced', { elements: board.elements, action: 'redo' });
        scheduleBoardSave(currentRoomId);
      }
    });

    // Chat Message
    socket.on('send-chat', ({ text }) => {
      if (!currentRoomId || !text || !text.trim()) return;

      const msg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        user: currentUser,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const board = getMemoryBoard(currentRoomId);

      if (!board) return;

      // Save chat message in memory
      if (!board.chatMessages) {
        board.chatMessages = [];
      }

      board.chatMessages.push(msg);

      board.updatedAt = new Date();

      // Send message to everyone
      io.to(currentRoomId).emit('chat-received', msg);

      // Persist to MongoDB
      scheduleBoardSave(currentRoomId);
    });

    // Disconnect / Leave
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ${socket.id}`);
      if (currentRoomId && roomActiveUsers.has(currentRoomId)) {
        const roomMap = roomActiveUsers.get(currentRoomId);
        const leavingUser = roomMap.get(socket.id);
        roomMap.delete(socket.id);

        const updatedActiveUsers = Array.from(roomMap.values());
        socket.to(currentRoomId).emit('user-left', {
          socketId: socket.id,
          user: leavingUser,
          activeUsers: updatedActiveUsers
        });

        if (roomMap.size === 0) {
          // Final save on room empty
          saveBoardToDb(currentRoomId);
        }
      }
    });
  });
};

module.exports = setupWhiteboardSocket;
