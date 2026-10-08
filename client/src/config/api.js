// API and Socket backend configuration
export const BACKEND_URL = 
  import.meta.env.VITE_BACKEND_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://realtime-whiteboard-collaborative-rooms-1.onrender.com');

export const API_BASE_URL = `${BACKEND_URL}/api`;
