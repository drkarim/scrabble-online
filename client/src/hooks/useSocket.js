import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3000';

let socketInstance = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { autoConnect: false });
  }
  return socketInstance;
}

export function useSocket(handlers) {
  const socket = useRef(getSocket());
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const s = socket.current;
    if (!s.connected) s.connect();

    const events = [
      'room:joined', 'room:error',
      'player:joined', 'player:left', 'player:reconnected',
      'game:started', 'game:stateUpdate', 'game:ended',
      'player:tileUpdate',
      'move:valid', 'move:invalid',
    ];

    for (const event of events) {
      s.on(event, (...args) => {
        handlersRef.current?.[event]?.(...args);
      });
    }

    return () => {
      for (const event of events) s.off(event);
    };
  }, []);

  const emit = useCallback((event, data) => {
    socket.current.emit(event, data);
  }, []);

  return { emit, socket: socket.current };
}
