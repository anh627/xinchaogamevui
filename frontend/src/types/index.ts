// User Types
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  statistics: UserStatistics;
  createdAt: Date;
}

export interface UserStatistics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Game Types
export enum GameType {
  UNO = 'uno',
  CHESS = 'chess',
  CHECKERS = 'checkers'
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export interface Game {
  id: string;
  type: GameType;
  status: GameStatus;
  players: Player[];
  currentTurn?: string;
  winner?: string;
  startedAt?: Date;
  endedAt?: Date;
  timeLimit?: number;
}

export interface Player {
  userId: string;
  username: string;
  isAI: boolean;
  isReady: boolean;
  color?: string;
}

// Tournament Types
export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin'
}

export enum TournamentStatus {
  REGISTRATION = 'registration',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Tournament {
  id: string;
  name: string;
  gameType: GameType;
  format: TournamentFormat;
  status: TournamentStatus;
  maxParticipants: number;
  participants: string[];
  prize?: string;
  registrationDeadline: Date;
  startDate: Date;
  endDate?: Date;
  bracket?: TournamentBracket;
}

export interface TournamentBracket {
  rounds: Round[];
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Match {
  id: string;
  player1?: string;
  player2?: string;
  winner?: string;
  gameId?: string;
  scheduledAt?: Date;
}