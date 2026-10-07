import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WhiteboardProvider } from './context/WhiteboardContext';
import { Home } from './pages/Home';
import { RoomPage } from './pages/RoomPage';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <WhiteboardProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<Home onOpenAuth={() => setAuthOpen(true)} />}
            />
            <Route
              path="/room/:roomId"
              element={<RoomPage />}
            />
          </Routes>

          <AuthModal
            isOpen={authOpen}
            onClose={() => setAuthOpen(false)}
          />
        </Router>
      </WhiteboardProvider>
    </AuthProvider>
  );
}
