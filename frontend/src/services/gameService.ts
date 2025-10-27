import { apiService } from './api';
import { Game, GameType, GameStatus, Player } from '../types';

export interface CreateGameOptions {
  type: GameType;
  isPrivate?: boolean;
  maxPlayers?: number;
  timeLimit?: number;
  allowSpectators?: boolean;
}

export interface JoinGameOptions {
  gameId: string;
  password?: string;
}

export interface GameMove {
  gameId: string;
  playerId: string;
  move: any; // Different for each game type
  timestamp: number;
}

class GameService {
  private baseUrl = '/api/games';

  // Create a new game room
  async createGame(options: CreateGameOptions): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/create`, options);
  }

  // Join an existing game
  async joinGame(options: JoinGameOptions): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/join`, options);
  }

  // Find a random game to join
  async findGame(gameType: GameType): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/find`, { gameType });
  }

  // Get game by ID
  async getGame(gameId: string): Promise<Game> {
    return apiService.get<Game>(`${this.baseUrl}/${gameId}`);
  }

  // Get active games list
  async getActiveGames(gameType?: GameType): Promise<Game[]> {
    const params = gameType ? { type: gameType } : {};
    return apiService.get<Game[]>(`${this.baseUrl}/active`, { params });
  }

  // Get user's game history
  async getGameHistory(userId: string, limit = 20): Promise<Game[]> {
    return apiService.get<Game[]>(`${this.baseUrl}/history/${userId}`, {
      params: { limit }
    });
  }

  // Leave a game
  async leaveGame(gameId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/${gameId}/leave`);
  }

  // Surrender a game
  async surrenderGame(gameId: string): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/${gameId}/surrender`);
  }

  // Request rematch
  async requestRematch(gameId: string): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/${gameId}/rematch`);
  }

  // Get available AI difficulties
  getAIDifficulties() {
    return ['Easy', 'Medium', 'Hard', 'Expert'];
  }

  // Play against AI
  async playAgainstAI(gameType: GameType, difficulty: string): Promise<Game> {
    return apiService.post<Game>(`${this.baseUrl}/ai`, {
      gameType,
      difficulty
    });
  }

  // Spectate a game
  async spectateGame(gameId: string): Promise<Game> {
    return apiService.get<Game>(`${this.baseUrl}/${gameId}/spectate`);
  }
}

export const gameService = new GameService();