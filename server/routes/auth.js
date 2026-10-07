const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const mongoose = require('mongoose');

// In-Memory fallback store for users when MongoDB is not active
const memoryUsers = new Map();

// Helper to check if Mongoose connection is ready
const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const user = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatarColor
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email, avatarColor: user.avatarColor },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, avatarColor: user.avatarColor }
      });
    } else {
      // Memory mode fallback
      if (memoryUsers.has(email.toLowerCase())) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const memUser = {
        id: 'user_' + Date.now(),
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatarColor
      };
      memoryUsers.set(email.toLowerCase(), memUser);

      const token = jwt.sign(
        { id: memUser.id, username: memUser.username, email: memUser.email, avatarColor: memUser.avatarColor },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: { id: memUser.id, username: memUser.username, email: memUser.email, avatarColor: memUser.avatarColor }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = memoryUsers.get(email.toLowerCase());
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userId = user._id ? user._id.toString() : user.id;

    const token = jwt.sign(
      { id: userId, username: user.username, email: user.email, avatarColor: user.avatarColor },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: userId, username: user.username, email: user.email, avatarColor: user.avatarColor }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
