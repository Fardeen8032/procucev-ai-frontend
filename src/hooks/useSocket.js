import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../api/client.js';

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ['websocket'] });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
