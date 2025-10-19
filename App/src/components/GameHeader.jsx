
import React from 'react';
import { motion } from 'framer-motion';
import {Trophy, Hash, Music, User} from 'lucide-react';

const GameHeader = ({ score, round, gameMode }) => {
  const modeConfig = {
    lyrics: { icon: Music, label: 'N\'oubliez pas les paroles', color: 'text-purple-400' },
    artist: { icon: User, label: 'Qui a dit ça ?', color: 'text-blue-400' }
  };

  const config = modeConfig[gameMode] || modeConfig.lyrics;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between mb-8 p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700"
    >
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <IconComponent className={`w-6 h-6 ${config.color}`} />
        <h2 className="text-xl font-bold text-white">
          {config.label}
        </h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-bold text-white">{score} pts</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-300">Manche {round}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GameHeader;
