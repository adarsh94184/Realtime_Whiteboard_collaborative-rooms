import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { useAuth } from '../context/AuthContext';
import { Send, X, MessageSquare, Sparkles } from 'lucide-react';

export const ChatPanel = ({ onSendChat }) => {
  const { isChatOpen, setIsChatOpen, chatMessages } = useWhiteboard();
  const { user } = useAuth();
  const [text, setText] = useState('');

  if (!isChatOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && onSendChat) {
      onSendChat(text);
      setText('');
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        width: '320px',
        height: 'calc(100vh - 170px)',
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Room Chat</span>
        </div>
        <button
          className="glass-btn"
          style={{ padding: '4px', borderRadius: '50%' }}
          onClick={() => setIsChatOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{
        flex: 1,
        padding: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {chatMessages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: 'auto',
            marginBottom: 'auto',
            fontSize: '0.85rem'
          }}>
            <Sparkles size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No messages yet.</p>
            <p>Start chatting with collaborators!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.user?.id === user?.id || msg.user?.username === user?.username;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ fontWeight: 600, color: msg.user?.avatarColor || 'var(--accent-primary)' }}>
                    {msg.user?.username || 'Collaborator'}
                  </span>
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  style={{
                    background: isMe ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: isMe ? '#fff' : 'var(--text-main)',
                    padding: '8px 12px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.85rem',
                    maxWidth: '85%',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} style={{
        padding: '10px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          className="glass-input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontSize: '0.85rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
