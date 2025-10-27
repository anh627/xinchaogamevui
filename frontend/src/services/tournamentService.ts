import { apiService } from './api';
import { Tournament, TournamentFormat, TournamentStatus } from '../types';

export interface CreateTournamentOptions {
  name: string;
  gameType: string;
  format: TournamentFormat;
  maxParticipants: number;
  registrationDeadline: Date;
  startDate: Date;
  prize?: string;
  entryFee?: number;
  description?: string;
  rules?: string[];
}

class TournamentService {
  private baseUrl = '/api/tournaments';

  // Create tournament (admin only)
  async createTournament(options: CreateTournamentOptions): Promise<Tournament> {
    return apiService.post<Tournament>(`${this.baseUrl}/create`, options);
  }

  // Get all tournaments
  async getTournaments(status?: TournamentStatus): Promise<Tournament[]> {
    const params = status ? { status } : {};
    return apiService.get<Tournament[]>(this.baseUrl, { params });
  }

  // Get tournament by ID
  async getTournament(id: string): Promise<Tournament> {
    return apiService.get<Tournament>(`${this.baseUrl}/${id}`);
  }

  // Register for tournament
  async registerForTournament(tournamentId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/${tournamentId}/register`);
  }

  // Unregister from tournament
  async unregisterFromTournament(tournamentId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/${tournamentId}/unregister`);
  }

  // Get tournament bracket
  async getTournamentBracket(tournamentId: string): Promise<any> {
    return apiService.get(`${this.baseUrl}/${tournamentId}/bracket`);
  }

  // Get tournament matches
  async getTournamentMatches(tournamentId: string): Promise<any[]> {
    return apiService.get(`${this.baseUrl}/${tournamentId}/matches`);
  }

  // Update match result (admin only)
  async updateMatchResult(tournamentId: string, matchId: string, winner: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/${tournamentId}/matches/${matchId}/result`, { winner });
  }

  // Start tournament (admin only)
  async startTournament(tournamentId: string): Promise<Tournament> {
    return apiService.post<Tournament>(`${this.baseUrl}/${tournamentId}/start`);
  }

  // Cancel tournament (admin only)
  async cancelTournament(tournamentId: string, reason: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/${tournamentId}/cancel`, { reason });
  }

  // Get my tournaments
  async getMyTournaments(): Promise<Tournament[]> {
    return apiService.get<Tournament[]>(`${this.baseUrl}/my-tournaments`);
  }

  // Get tournament leaderboard
  async getTournamentLeaderboard(tournamentId: string): Promise<any[]> {
    return apiService.get(`${this.baseUrl}/${tournamentId}/leaderboard`);
  }
}

export const tournamentService = new TournamentService();