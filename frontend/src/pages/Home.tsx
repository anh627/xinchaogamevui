import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameType } from '../types';
import { useAuth } from '../context/AuthContext';

interface GameCard {
  type: GameType;
  name: string;
  description: string;
  color: string;
  icon: string;
  players: string;
}

const games: GameCard[] = [
  {
    type: GameType.UNO,
    name: 'UNO',
    description: 'Classic card game of matching colors and numbers',
    color: 'bg-game-uno',
    icon: '🎴',
    players: '2-4 players'
  },
  {
    type: GameType.CHESS,
    name: 'Chess',
    description: 'Strategic board game of kings and queens',
    color: 'bg-game-chess',
    icon: '♟️',
    players: '2 players'
  },
  {
    type: GameType.CHECKERS,
    name: 'Checkers',
    description: 'Jump and capture your way to victory',
    color: 'bg-game-card',
    icon: '⚫',
    players: '2 players'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePlayGame = (gameType: GameType) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/game/${gameType}` } });
      return;
    }
    navigate(`/game/${gameType}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-primary-500 to-primary-700 -mx-8 px-8 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to GameHub
        </h1>
        <p className="text-xl mb-8 text-primary-100">
          Play classic board games online with friends or AI opponents
        </p>
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started Free
          </button>
        )}
      </section>

      {/* Games Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Choose Your Game</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.type}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handlePlayGame(game.type)}
            >
              <div className={`${game.color} h-32 flex items-center justify-center`}>
                <span className="text-6xl">{game.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{game.players}</span>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Tournaments */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6">Active Tournaments</h2>
        <div className="space-y-4">
          <TournamentPreview
            name="Chess Championship 2024"
            participants={24}
            maxParticipants={32}
            prize="$500"
            deadline={new Date('2024-12-31')}
          />
          <TournamentPreview
            name="UNO Masters"
            participants={16}
            maxParticipants={16}
            prize="Trophy"
            deadline={new Date('2024-12-25')}
          />
        </div>
        <button
          onClick={() => navigate('/tournaments')}
          className="mt-6 w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50"
        >
          View All Tournaments
        </button>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Players" value="1,234" icon="👥" />
        <StatCard label="Games Played Today" value="5,678" icon="🎮" />
        <StatCard label="Tournaments Running" value="12" icon="🏆" />
      </section>
    </div>
  );
};

const TournamentPreview: React.FC<{
  name: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  deadline: Date;
}> = ({ name, participants, maxParticipants, prize, deadline }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-sm text-gray-600">
          {participants}/{maxParticipants} players • Prize: {prize}
        </p>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
        Open
      </span>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-primary-600">{value}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

export default Home;