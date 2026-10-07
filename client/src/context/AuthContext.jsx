import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wb_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize guest profile if no logged-in user exists
  const [guestUser, setGuestUser] = useState(() => {
    const saved = localStorage.getItem('wb_guest_user');
    if (saved) return JSON.parse(saved);
    
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const newGuest = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: 'Guest ' + Math.floor(1000 + Math.random() * 9000),
      avatarColor: randomColor,
      isGuest: true
    };
    localStorage.setItem('wb_guest_user', JSON.stringify(newGuest));
    return newGuest;
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Invalid token
            localStorage.removeItem('wb_token');
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('wb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('wb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('wb_token');
    setToken(null);
    setUser(null);
  };

  const currentUser = user || guestUser;

  return (
    <AuthContext.Provider value={{ user: currentUser, isGuest: !user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
