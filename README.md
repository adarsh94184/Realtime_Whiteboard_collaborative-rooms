# DrawFlow — Real-Time Collaborative Whiteboard

DrawFlow is an industry-grade real-time collaborative whiteboard application built with **React**, **HTML5 Canvas**, **Socket.IO**, **Express**, and **MongoDB**.

![DrawFlow Screenshot](client/public/screenshot.png)

---

## 🚀 Key Features

### 1. Phase 1 — Single-User Whiteboard Engine
- **Canvas Drawing Tools**: Pencil (freehand stroke curve smoothing), Eraser, Line, Arrow, Rectangle, Circle, Text tool, Sticky Note cards, Image Upload.
- **Customizable Styling**: Stroke color swatches + custom color picker, Fill color (solid/transparent), Stroke width (2px–14px), Opacity control, Line pattern (solid, dashed, dotted).
- **Infinite Canvas Controls**: Wheel zoom (15% to 500%), smooth canvas panning matrix transformation, Fit to screen.

### 2. Phase 2 & 3 — Socket.IO Real-Time Communication & Dynamic Rooms
- **Sub-10ms Streaming**: Real-time pencil stroke point streaming for instant peer drawing visualization.
- **Room Isolation**: Dynamically isolated room channels (`io.to(roomId).emit(...)`). Join/create custom room IDs (e.g., `/room/a1b2c3d4`).
- **Shareable Links**: 1-click room link generator (`http://localhost:5173/room/<roomId>`).

### 3. Phase 4 & 5 — MongoDB Persistence & JWT Authentication
- **Board Hydration**: Synchronizes initial board state when users enter a room.
- **State Auto-Persistence**: Background debounced state auto-saving to MongoDB (with high-performance in-memory fallback store if local MongoDB is not running).
- **JWT Auth**: User registration, login, JWT token verification, and guest join mode.
- **Saved Whiteboards Drawer**: "My Boards" modal to manage created whiteboards.

### 4. Phase 6 & 7 — Real-Time Collaboration & Synchronization
- **Live Cursors & Presence**: Peer mouse cursors with name tags, custom avatar colors, and tool status moving in real-time across the screen.
- **Active User Stack**: Real-time room member count & avatar stack in top navbar.
- **Collaboration Chat**: In-room live text chat panel with user badges.
- **Undo / Redo**: Room history stack synchronization across connected clients.
- **Export Options**: Download canvas as high-resolution **PNG**, **JPEG**, or raw **JSON** data backup.

---

## 🛠️ Project Structure

```
Real_time_whiteboard/
├── client/                      # Vite + React Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Toolbar, StylePicker, WhiteboardCanvas, LiveCursors, ChatPanel, BottomControls
│   │   ├── context/             # AuthContext, WhiteboardContext
│   │   ├── hooks/               # useSocket custom socket hook
│   │   ├── utils/               # canvasUtils (rendering & hit tests), exportUtils (PNG/JSON export)
│   │   ├── pages/               # Home landing page, RoomPage collaborative view
│   │   ├── App.jsx
│   │   └── index.css            # Glassmorphism design system & CSS variables
│   └── package.json
│
└── server/                      # Node.js + Express + Socket.IO Backend
    ├── config/                  # MongoDB database connector
    ├── models/                  # User and Board Mongoose schemas
    ├── routes/                  # Auth and Board API endpoints
    ├── socket/                  # whiteboardSocket real-time event handlers
    ├── store/                   # High-performance memoryStore fallback
    ├── server.js                # Express & Socket.IO server entry point
    └── package.json
```

---

## ⚡ Quick Start

### 1. Start Backend Server
```bash
cd server
npm start
```
Server runs on `http://localhost:5000` with WebSocket endpoint at `ws://localhost:5000`.

### 2. Start Frontend App
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173/`. Open in multiple browser windows or share the room link to test real-time collaboration!
