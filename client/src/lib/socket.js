import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
  auth: {
    token: localStorage.getItem('devpulse_token'),
  },
  autoConnect: false, // we connect manually in the hook
});
