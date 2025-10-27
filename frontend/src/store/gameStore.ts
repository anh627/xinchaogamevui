import { create } from 'zustand';
import { Game, User } from '../types';

interface GameStore {
  currentGame: Game | null;
  activeGames: Game[];
  setCurrentGame: (game: Game | null) => void;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  addActiveGame: (game: Game) => void;
  removeActiveGame: (gameId: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: null,
  activeGames: [],
  
  setCurrentGame: (game) => set({ currentGame: game }),
  
  updateGame: (gameId, updates) => set((state) => ({
    currentGame: state.currentGame?.id === gameId 
      ? { ...state.currentGame, ...updates }
      : state.currentGame,
    activeGames: state.activeGames.map(g => 
      g.id === gameId ? { ...g, ...updates } : g
    )
  })),
  
  addActiveGame: (game) => set((state) => ({
    activeGames: [...state.activeGames, game]
  })),
  
  removeActiveGame: (gameId) => set((state) => ({
    activeGames: state.activeGames.filter(g => g.id !== gameId)
  }))
}));