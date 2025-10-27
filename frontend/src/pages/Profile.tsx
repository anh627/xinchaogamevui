import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  if (!user) {
    navigate('/login');
    return null;
  }

  const stats = [
    { label: 'Games Played', value: user.statistics.gamesPlayed, icon: '🎮' },
    { label: 'Wins', value: user.statistics.wins, icon: '🏆' },
    { label: 'Win Rate', value: `${Math.round((user.statistics.wins / Math.max(user.statistics.gamesPlayed, 1)) * 100)}%`, icon: '📊' },
    { label: 'Rating', value: user.statistics.rating, icon: '⭐' },
  ];

  const recentGames = [
    { id: '1', game: 'Chess', opponent: 'Player123', result: 'Win', date: '2024-01-15' },
    { id: '2', game: 'UNO', opponent: 'AI Bot', result: 'Loss', date: '2024-01-14' },
    { id: '3', game: 'Checkers', opponent: 'JohnDoe', result: 'Win', date: '2024-01-13' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-4 text-center"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-800'
              }`
            }
          >
            Recent Games
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-800'
              }`
            }
          >
            Achievements
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-800'
              }`
            }
          >
            Statistics
          </Tab>
        </Tab.List>
        <Tab.Panels>
          {/* Recent Games Panel */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {game.game === 'Chess' ? '♟️' : game.game === 'UNO' ? '🎴' : '⚫'}
                    </span>
                    <div>
                      <p className="font-medium">{game.game} vs {game.opponent}</p>
                      <p className="text-sm text-gray-500">{game.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    game.result === 'Win' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.result}
                  </span>
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* Achievements Panel */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {user.statistics.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.unlockedAt 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2 text-center">{achievement.icon}</div>
                  <h4 className="font-semibold text-center">{achievement.name}</h4>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* Statistics Panel */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Total Playing Time</span>
                <span className="font-semibold">42h 15m</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Favorite Game</span>
                <span className="font-semibold">Chess</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Best Win Streak</span>
                <span className="font-semibold">7 games</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Tournaments Won</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Profile;