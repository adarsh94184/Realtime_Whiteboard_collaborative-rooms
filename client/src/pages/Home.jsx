import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, ArrowRight, ShieldCheck, Users, Zap, Layout, MonitorPlay, Layers } from 'lucide-react';

export const Home = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [roomTitle, setRoomTitle] = useState('');
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/boards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: roomTitle || 'Collaborative Room' })
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        navigate(`/room/${data.roomId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      navigate(`/room/${joinId.trim()}`);
    }
  };

  const handleTemplateSelect = async (templateName) => {
    setLoading(true);
    try {
      const res = await fetch('/api/boards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${templateName} Canvas` })
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        navigate(`/room/${data.roomId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, #0b0f19 70%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-main)',
      overflowY: 'auto'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.6)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800 }} className="text-gradient">
            DrawFlow
          </span>
        </div>

        <div>
          {isGuest ? (
            <button className="btn-primary" onClick={onOpenAuth}>
              Sign In / Register
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Welcome, {user.username}!</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero */}
      <main style={{ flex: 1, maxW: '1200px', margin: '0 auto', padding: '60px 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginBottom: '20px'
          }}>
            <Zap size={14} /> Next-Gen Real-Time Whiteboard Engine
          </div>

          <h1 style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '20px'
          }}>
            Collaborate, draw, and brainstorm with your team <span className="text-gradient">in real time</span>.
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Powered by HTML5 Canvas, WebSockets (Socket.IO), Node.js, and MongoDB state synchronization.
            Instant rooms, fluid brush engine, live presence cursors, and infinite canvas.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {/* Create Room Card */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary)'
              }}>
                <Plus size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Start a New Whiteboard</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create a room and share the link</p>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Whiteboard Title (Optional)"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Creating Room...' : 'Create Whiteboard Room'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Join Room Card */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.2)',
                color: 'var(--accent-secondary)'
              }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Join Existing Room</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter a room code or ID to join</p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Enter Room ID (e.g. a1b2c3d4)"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                required
              />
              <button type="submit" className="glass-btn" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                Join Whiteboard Room
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }} className="text-gradient">
            Engineered for High Performance
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {[
            { title: 'Sub-10ms Streaming', desc: 'Real-time Socket.IO stroke broadcasting with zero lag.', icon: Zap },
            { title: 'Live Peer Presence', desc: 'See peer cursor movements, selection states & member avatars.', icon: Users },
            { title: 'Infinite Canvas', desc: 'Smooth pan & zoom matrix transformations from 15% to 500%.', icon: Layout },
            { title: 'Persistent Board State', desc: 'Auto-persisted to MongoDB so your work is never lost.', icon: ShieldCheck }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
                <Icon size={24} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
