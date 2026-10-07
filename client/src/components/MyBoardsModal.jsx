import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Folder, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export const MyBoardsModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && token) {
      fetch('/api/boards/my-boards', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBoards(data.boards || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleOpenRoom = (roomId) => {
    navigate(`/room/${roomId}`);
    onClose();
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/boards/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => prev.filter(b => b.roomId !== roomId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '480px', maxHeight: '80vh', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }} className="text-gradient">
            My Whiteboards
          </h2>
          <button
            className="glass-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading saved boards...</div>
          ) : boards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No saved whiteboards yet. Create one from the home screen!
            </div>
          ) : (
            boards.map(b => (
              <div
                key={b.roomId}
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onClick={() => handleOpenRoom(b.roomId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Folder size={20} color="var(--accent-primary)" />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{b.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ID: {b.roomId}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="glass-btn"
                    style={{ padding: '6px', color: '#ef4444' }}
                    onClick={(e) => handleDeleteRoom(b.roomId, e)}
                    title="Delete whiteboard"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
