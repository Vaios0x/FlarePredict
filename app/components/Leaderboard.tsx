'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  totalWins: number;
  totalBets: number;
  winRate: number;
  totalEarnings: number;
}

interface LeaderboardProps {
  onBack: () => void;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  // Mock data - in a real implementation this would come from the contract
  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      address: '0x1234...5678',
      username: 'Prediction Master',
      totalWins: 45,
      totalBets: 52,
      winRate: 86.5,
      totalEarnings: 1250.50
    },
    {
      rank: 2,
      address: '0x8765...4321',
      username: 'Oracle Whisperer',
      totalWins: 38,
      totalBets: 45,
      winRate: 84.4,
      totalEarnings: 980.25
    },
    {
      rank: 3,
      address: '0x9999...8888',
      username: 'Flare Fortune',
      totalWins: 32,
      totalBets: 41,
      winRate: 78.0,
      totalEarnings: 745.80
    },
    {
      rank: 4,
      address: '0x7777...6666',
      username: 'Crystal Baller',
      totalWins: 28,
      totalBets: 38,
      winRate: 73.7,
      totalEarnings: 620.15
    },
    {
      rank: 5,
      address: '0x5555...4444',
      username: 'Future Seer',
      totalWins: 25,
      totalBets: 35,
      winRate: 71.4,
      totalEarnings: 520.90
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-400">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-black';
      case 3: return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default: return 'bg-white/10 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-300 text-lg">The best predictors on FlarePredict</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-gray-300 text-sm">Active Predictors</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">5,890</div>
                <div className="text-gray-300 text-sm">Total Bets</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">78.5%</div>
                <div className="text-gray-300 text-sm">Average Win Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Top Predictors</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaderboardData.map((entry, index) => (
                  <motion.tr
                    key={entry.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadge(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{entry.username}</div>
                        <div className="text-sm text-gray-400">{entry.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {entry.totalWins}/{entry.totalBets}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-white">{entry.winRate}%</div>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${entry.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-400">
                        {entry.totalEarnings.toFixed(2)} FLR
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <span>← Back</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
