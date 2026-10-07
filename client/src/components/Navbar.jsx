import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { useAuth } from '../context/AuthContext';
import { copyRoomLink, exportToImage, exportToJSON } from '../utils/exportUtils';
import { Share2, Download, MessageSquare, Users, User, LogIn, LogOut, Check, Sparkles, FolderKanban } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenMyBoards }) => {
  const { roomId, roomTitle, activeUsers, isChatOpen, setIsChatOpen, elements } = useWhiteboard();
  const { user, isGuest, logout } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleShare = () => {
    if (roomId) {
      copyRoomLink(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportImg = (format) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportToImage(canvas, roomTitle || 'whiteboard', format);
    }
    setShowExportMenu(false);
  };

  const handleExportData = () => {
    exportToJSON(elements, roomTitle);
    setShowExportMenu(false);
  };

  return (
    <nav className="top-navbar glass-panel">
      {/* Left section: Logo & Room Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">
            DrawFlow
          </span>
        </div>

        <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {roomTitle || 'Collaborative Room'}
          </span>
          {roomId && (
            <span style={{
              fontSize: '0.75rem',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 8px',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              ID: {roomId}
            </span>
          )}
        </div>
      </div>

      {/* Center/Right section: Active users, Share, Chat, Export & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Active Users Avatar Stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }} title={`${activeUsers.length} Active Collaborators`}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginRight: '6px'
          }}>
            <Users size={14} />
            <span>{activeUsers.length} online</span>
          </div>

          {activeUsers.slice(0, 4).map((u, i) => (
            <div
              key={u.socketId || i}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: u.avatarColor || '#6366f1',
                border: '2px solid var(--bg-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                marginLeft: i > 0 ? '-8px' : 0
              }}
              title={u.username}
            >
              {u.username.substring(0, 1).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Share Room Button */}
        <button className="glass-btn" onClick={handleShare}>
          {copied ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>

        {/* Chat Toggle Button */}
        <button
          className={`glass-btn ${isChatOpen ? 'active' : ''}`}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageSquare size={16} />
          <span>Chat</span>
        </button>

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button className="glass-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
            <Download size={16} />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '170px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 70
            }}>
              <button className="glass-btn" style={{ justifyContent: 'flex-start' }} onClick={() => handleExportImg('png')}>
                PNG Image
              </button>
              <button className="glass-btn" style={{ justifyContent: 'flex-start' }} onClick={() => handleExportImg('jpeg')}>
                JPEG Image
              </button>
              <button className="glass-btn" style={{ justifyContent: 'flex-start' }} onClick={handleExportData}>
                JSON File
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }} />

        {/* My Boards */}
        {!isGuest && (
          <button className="glass-btn" onClick={onOpenMyBoards}>
            <FolderKanban size={16} />
            <span>My Boards</span>
          </button>
        )}

        {/* User Auth Profile / Login */}
        {isGuest ? (
          <button className="btn-primary" onClick={onOpenAuth}>
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.85rem'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: user.avatarColor || '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>
                {user.username.substring(0, 1).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600 }}>{user.username}</span>
            </div>

            <button className="glass-btn" onClick={logout} title="Sign Out">
              <LogOut size={16} color="#ef4444" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
