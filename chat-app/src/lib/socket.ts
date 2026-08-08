import { io, Socket } from 'socket.io-client';
import { handleChatAuthError } from '../utils/authRedirect';

let rawUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:4000';

// Fix accidental double 'https://' if present in the environment variables
if (rawUrl.startsWith('https://https://')) {
  rawUrl = rawUrl.replace('https://https://', 'https://');
} else if (rawUrl.startsWith('http://http://')) {
  rawUrl = rawUrl.replace('http://http://', 'http://');
}

let SOCKET_URL = rawUrl;
try {
  // This automatically strips paths like /api and gives just the base domain
  // (e.g. https://your-backend.com)
  SOCKET_URL = new URL(rawUrl).origin;
} catch (error) {
  console.error(
    'Invalid socket URL provided in environment variables:',
    rawUrl
  );
}

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const session =
      typeof window !== 'undefined'
        ? localStorage.getItem('chatSessionId')
        : null;
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: {
        sessionId: session || undefined,
      },
    });

    socket.on('connect_error', (err) => {
      if (
        err.message?.includes('Authentication error') ||
        err.message?.includes('Missing session') ||
        err.message?.includes('Unauthorized')
      ) {
        handleChatAuthError();
      }
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
