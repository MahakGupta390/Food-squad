import { io } from 'socket.io-client';
import { getToken, getActiveRoom } from './api.js';

let socketInstance = null;

export function getSocket(onRoomUpdate) {
  const token = getToken();
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // Connect socket with JWT token auth
  socketInstance = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    const room = getActiveRoom();
    if (room) {
      socketInstance.emit('join-room', room, () => {});
    }
  });

  if (onRoomUpdate) {
    socketInstance.off('room:update');
    socketInstance.on('room:update', (data) => {
      onRoomUpdate(data);
    });
  }

  return socketInstance;
}

export function joinRoomSocket(roomCode) {
  if (socketInstance && socketInstance.connected && roomCode) {
    socketInstance.emit('join-room', roomCode.toUpperCase(), () => {});
  }
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
