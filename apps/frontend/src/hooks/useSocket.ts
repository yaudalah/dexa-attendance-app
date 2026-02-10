import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSocket(onProfileUpdated: (payload: unknown) => void) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('profile-updated', onProfileUpdated);
    return () => {
      socket.off('profile-updated');
      socket.disconnect();
    };
  }, [onProfileUpdated]);
}
