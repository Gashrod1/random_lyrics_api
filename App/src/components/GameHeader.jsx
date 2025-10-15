
import React from 'react';
import { motion } from 'framer-motion';
import {Trophy, Target} from 'lucide-react';

const GameHeader = ({ score, round }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <motion.h1
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-6"
      >
        🎤 N'oubliez pas les paroles
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-300 mb-8"
      >
        Édition Rap Français
      </motion.p>
      
      <div className="flex justify-center items-center gap-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-gray-400">points</span>
        </div>
        
        <div className="w-px h-8 bg-gray-600"></div>
        
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          <span className="text-2xl font-bold text-white">{round}</span>
          <span className="text-gray-400">manche</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GameHeader;
