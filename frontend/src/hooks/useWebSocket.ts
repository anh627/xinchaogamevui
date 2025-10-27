import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url: string;
  room?: string;
  autoConnect?: boolean;
}

export const useWebSocket = ({ url, room, autoConnect = true }: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (autoConnect) {
      socketRef.current = io(url, {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token')
        }
      });

      if (room) {
        socketRef.current.emit('join-room', room);
      }

      return () => {
        if (socketRef.current) {
          if (room) {
            socketRef.current.emit('leave-room', room);
          }
          socketRef.current.disconnect();
        }
      };
    }
  }, [url, room, autoConnect]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return { socket: socketRef.current, emit, on, off };
};