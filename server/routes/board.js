const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Board = require('../models/Board');
const { optionalAuthMiddleware, authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');
const { memoryBoards, getMemoryBoard, setMemoryBoard } = require('../store/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/boards/create
router.post('/create', optionalAuthMiddleware, async (req, res) => {
  try {
    const { title, isPublic, passcode } = req.body;
    const roomId = uuidv4().substring(0, 8); // e.g. "a1b2c3d4"
    const ownerId = req.user ? req.user.id : null;
    const ownerName = req.user ? req.user.username : 'Guest Owner';

    const boardData = {
      roomId,
      title: title || `Whiteboard-${roomId}`,
      owner: ownerId,
      ownerName,
      isPublic: isPublic !== undefined ? isPublic : true,
      passcode: passcode || '',
      elements: [],
      undoStack: [],
      redoStack: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected()) {
      const newBoard = new Board(boardData);
      await newBoard.save();
    }
    
    // Always store in memory cache for instant Socket access
    setMemoryBoard(roomId, boardData);

    res.status(201).json({
      message: 'Board created successfully',
      roomId,
      board: boardData
    });
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ message: 'Failed to create whiteboard room' });
  }
});

// GET /api/boards/my-boards
router.get('/my-boards', authMiddleware, async (req, res) => {
  try {
    let boards = [];
    if (isDbConnected()) {
      boards = await Board.find({ owner: req.user.id }).select('roomId title isPublic createdAt updatedAt').sort({ updatedAt: -1 });
    } else {
      for (const board of memoryBoards.values()) {
        if (board.owner === req.user.id) {
          boards.push({
            roomId: board.roomId,
            title: board.title,
            isPublic: board.isPublic,
            createdAt: board.createdAt,
            updatedAt: board.updatedAt
          });
        }
      }
    }

    res.json({ boards });
  } catch (err) {
    console.error('Error fetching my boards:', err);
    res.status(500).json({ message: 'Failed to fetch user boards' });
  }
});

// GET /api/boards/:roomId
router.get('/:roomId', optionalAuthMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    let board = null;
    if (memoryBoards.has(roomId)) {
      board = memoryBoards.get(roomId);
    } else if (isDbConnected()) {
      board = await Board.findOne({ roomId });
      if (board) {
        setMemoryBoard(roomId, board.toObject());
      }
    }

    if (!board) {
      board = {
        roomId,
        title: `Room ${roomId}`,
        owner: null,
        ownerName: 'Room Host',
        isPublic: true,
        passcode: '',
        elements: [],
        undoStack: [],
        redoStack: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMemoryBoard(roomId, board);
      if (isDbConnected()) {
        const newBoard = new Board(board);
        await newBoard.save().catch(e => console.error('Auto-save error:', e));
      }
    }

    res.json({ board });
  } catch (err) {
    console.error('Error fetching board:', err);
    res.status(500).json({ message: 'Failed to load whiteboard room' });
  }
});

// DELETE /api/boards/:roomId
router.delete('/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (isDbConnected()) {
      await Board.deleteOne({ roomId, owner: req.user.id });
    }
    memoryBoards.delete(roomId);

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ message: 'Failed to delete board' });
  }
});

module.exports = router;
