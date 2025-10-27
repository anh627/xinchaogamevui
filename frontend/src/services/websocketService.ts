import io, { Socket } from 'socket.io-client';
import { Game, GameMove } from '../types';

export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // Room events
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  ROOM_JOINED = 'room-joined',
  ROOM_LEFT = 'room-left',
  
  // Game events
  FIND_GAME = 'find-game',
  GAME_FOUND = 'game-found',
  GAME_START = 'game-start',
  GAME_UPDATE = 'game-update',
  GAME_END = 'game-end',
  
  // Player events
  PLAYER_JOIN = 'player-join',
  PLAYER_LEAVE = 'player-leave',
  PLAYER_READY = 'player-ready',
  PLAYER_MOVE = 'player-move',
  PLAYER_TURN = 'player-turn',
  
  // Chat events
  CHAT_MESSAGE = 'chat-message',
  CHAT_TYPING = 'chat-typing',
  
  // Spectator events
  SPECTATOR_JOIN = 'spectator-join',
  SPECTATOR_LEAVE = 'spectator-leave',
}

interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, Set<Function>> = new Map();
  private rooms: Set<string> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    };
  }

  // Initialize connection
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.config.url, {
        transports: ['websocket'],
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      this.socket.on(SocketEvents.CONNECT, () => {
        console.log('WebSocket connected');
        this.rejoinRooms();
        resolve();
      });

      this.socket.on(SocketEvents.DISCONNECT, (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on(SocketEvents.ERROR, (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });

      // Setup global event listeners
      this.setupGlobalListeners();
    });
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.rooms.clear();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a game room
  joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(SocketEvents.JOIN_ROOM, roomId);
      
      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 5000);

      this.socket.once(SocketEvents.ROOM_JOINED, (room: string) => {
        clearTimeout(timeout);
        this.rooms.add(room);
        resolve();
      });
    });
  }

  // Leave a game room
  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) return;
    
    this.socket.emit(SocketEvents.LEAVE_ROOM, roomId);
    this.rooms.delete(roomId);
  }

  // Send game move
  sendMove(gameId: string, move: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit(SocketEvents.PLAYER_MOVE, {
      gameId,
      move,
      timestamp: Date.now()
    });
  }

  // Send chat message
  sendChatMessage(roomId: string, message: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(SocketEvents.CHAT_MESSAGE, {
      roomId,
      message,
      timestamp: Date.now()
    });
  }

  // Listen to an event
  on<T = any>(event: string, callback: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.removeAllListeners(event);
      }
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (this.socket) {
          this.socket.off(event, callback as any);
        }
      }
    }
  }

  // Emit an event
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Private methods
  private setupGlobalListeners(): void {
    if (!this.socket) return;

    // Re-attach listeners after reconnection
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket!.on(event, callback as any);
      });
    });
  }

  private rejoinRooms(): void {
    // Rejoin rooms after reconnection
    this.rooms.forEach(roomId => {
      this.socket?.emit(SocketEvents.JOIN_ROOM, roomId);
    });
  }
}

// Create singleton instance
export const wsService = new WebSocketService({
  url: process.env.REACT_APP_WS_URL || 'ws://localhost:3002'
});