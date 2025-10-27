import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { GameType, Game, GameStatus } from '../types';
import UnoGame from '../components/Games/UnoGame';
import ChessGame from '../components/Games/ChessGame';
import CheckersGame from '../components/Games/CheckersGame';

const GameRoom: React.FC = () => {
  const { gameType } = useParams<{ gameType: GameType }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { socket, emit, on, off } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3002',
    room: `game-${gameType}`
  });

  useEffect(() => {
    // Join game queue
    emit('find-game', { gameType });

    // Listen for game events
    on('game-found', (gameData: Game) => {
      setGame(gameData);
      setLoading(false);
    });

    on('game-update', (gameData: Game) => {
      setGame(gameData);
    });

    on('game-ended', (result: any) => {
      alert(`Game ended! Winner: ${result.winner}`);
      navigate('/');
    });

    return () => {
      off('game-found');
      off('game-update');
      off('game-ended');
    };
  }, [gameType, emit, on, off, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-lg">Finding opponent...</p>
      </div>
    );
  }

  const renderGame = () => {
    if (!game) return null;

    switch (gameType) {
      case GameType.UNO:
        return <UnoGame game={game} onMove={emit} />;
      case GameType.CHESS:
        return <ChessGame game={game} onMove={emit} />;
      case GameType.CHECKERS:
        return <CheckersGame game={game} onMove={emit} />;
      default:
        return <div>Game type not supported</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {renderGame()}
      </div>
    </div>
  );
};

export default GameRoom;