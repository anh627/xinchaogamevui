import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game, GameType, GameStatus } from '../types';
import { gameService } from '../services/gameService';
import { wsService, SocketEvents } from '../services/websocketService';
import { gameLogicService } from '../services/gameLogicService';
import { useAuth } from '../context/AuthContext';

interface UseGameOptions {
  gameType: GameType;
  gameId?: string;
  isSpectator?: boolean;
}

export const useGame = ({ gameType, gameId, isSpectator = false }: UseGameOptions) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true);
        setError(null);

        // Connect to WebSocket
        await wsService.connect();

        if (gameId) {
          // Join existing game
          const gameData = isSpectator 
            ? await gameService.spectateGame(gameId)
            : await gameService.getGame(gameId);
          
          setGame(gameData);
          await wsService.joinRoom(gameId);
        } else {
          // Find new game
          wsService.emit(SocketEvents.FIND_GAME, { gameType });
        }

        // Setup event listeners
        setupEventListeners();
      } catch (err: any) {
        setError(err.message || 'Failed to initialize game');
        setLoading(false);
      }
    };

    initGame();

    // Cleanup
    return () => {
      if (gameId) {
        wsService.leaveRoom(gameId);
      }
      removeEventListeners();
    };
  }, [gameType, gameId, isSpectator]);

  // Update turn status
  useEffect(() => {
    if (game && user && gameState) {
      setIsMyTurn(gameState.currentPlayer === user.id);
    }
  }, [game, user, gameState]);

  // Timer countdown
  useEffect(() => {
    if (!isMyTurn || !game?.timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          handleTimeout();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMyTurn, game?.timeLimit]);

  // Event listeners setup
  const setupEventListeners = useCallback(() => {
    // Game found
    wsService.on<Game>(SocketEvents.GAME_FOUND, (gameData) => {
      setGame(gameData);
      setLoading(false);
      if (gameData.id) {
        wsService.joinRoom(gameData.id);
      }
    });

    // Game started
    wsService.on(SocketEvents.GAME_START, (data) => {
      setGame(prev => prev ? { ...prev, status: GameStatus.IN_PROGRESS } : null);
      setGameState(data.gameState);
      setTimeRemaining(game?.timeLimit || null);
    });

    // Game updated
    wsService.on(SocketEvents.GAME_UPDATE, (data) => {
      setGameState(data.gameState);
      setTimeRemaining(data.timeRemaining || null);
    });

    // Player joined
    wsService.on(SocketEvents.PLAYER_JOIN, (data) => {
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: [...prev.players, data.player]
        };
      });
    });

    // Player left
    wsService.on(SocketEvents.PLAYER_LEAVE, (data) => {
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.filter(p => p.userId !== data.playerId)
        };
      });
    });

    // Game ended
    wsService.on(SocketEvents.GAME_END, (data) => {
      setGame(prev => prev ? { 
        ...prev, 
        status: GameStatus.COMPLETED,
        winner: data.winner,
        endedAt: new Date()
      } : null);
      
      // Show result modal
      handleGameEnd(data);
    });

    // Error
    wsService.on(SocketEvents.ERROR, (error) => {
      setError(error.message);
      setLoading(false);
    });
  }, [game]);

  const removeEventListeners = useCallback(() => {
    wsService.off(SocketEvents.GAME_FOUND);
    wsService.off(SocketEvents.GAME_START);
    wsService.off(SocketEvents.GAME_UPDATE);
    wsService.off(SocketEvents.PLAYER_JOIN);
    wsService.off(SocketEvents.PLAYER_LEAVE);
    wsService.off(SocketEvents.GAME_END);
    wsService.off(SocketEvents.ERROR);
  }, []);

  // Game actions
  const makeMove = useCallback((move: any) => {
    if (!game?.id || !isMyTurn || isSpectator) return;

    // Validate move locally first
    const isValid = gameLogicService.validateMove(gameType, gameState, move);
    if (!isValid) {
      setError('Invalid move');
      return;
    }

    // Send move to server
    wsService.sendMove(game.id, move);
  }, [game, isMyTurn, isSpectator, gameType, gameState]);

  const surrender = useCallback(async () => {
    if (!game?.id || isSpectator) return;
    
    if (confirm('Are you sure you want to surrender?')) {
      await gameService.surrenderGame(game.id);
    }
  }, [game, isSpectator]);

  const requestRematch = useCallback(async () => {
    if (!game?.id || isSpectator) return;
    
    const newGame = await gameService.requestRematch(game.id);
    navigate(`/game/${gameType}/${newGame.id}`);
  }, [game, isSpectator, gameType, navigate]);

  const sendChatMessage = useCallback((message: string) => {
    if (!game?.id) return;
    wsService.sendChatMessage(game.id, message);
  }, [game]);

  const handleTimeout = useCallback(() => {
    // Auto-play or forfeit on timeout
    if (game?.id) {
      wsService.emit(SocketEvents.PLAYER_TURN, {
        gameId: game.id,
        timeout: true
      });
    }
  }, [game]);

  const handleGameEnd = useCallback((result: any) => {
    // Show game result modal or notification
    const isWinner = result.winner === user?.id;
    const message = result.isDraw 
      ? "Game ended in a draw!" 
      : isWinner 
        ? "Congratulations! You won!" 
        : "You lost. Better luck next time!";
    
    // You can implement a modal here
    alert(message);
  }, [user]);

  return {
    game,
    gameState,
    loading,
    error,
    isMyTurn,
    timeRemaining,
    actions: {
      makeMove,
      surrender,
      requestRematch,
      sendChatMessage
    }
  };
};