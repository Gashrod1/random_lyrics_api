
import React from 'react';
import { motion } from 'framer-motion';
import {Trophy, RotateCcw, Star} from 'lucide-react';

const GameOverScreen = ({ score, round, onRestart }) => {
  const getPerformanceMessage = () => {
    const percentage = (score / (round * 10)) * 100;
    
    if (percentage >= 80) return { message: "Excellent ! Tu connais ton rap ! 🔥", color: "text-yellow-400" };
    if (percentage >= 60) return { message: "Bien joué ! Tu maîtrises ! 👏", color: "text-green-400" };
    if (percentage >= 40) return { message: "Pas mal ! Continue à écouter ! 🎵", color: "text-blue-400" };
    return { message: "Il faut réviser tes classiques ! 📚", color: "text-purple-400" };
  };

  const performance = getPerformanceMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Partie terminée !
        </h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8"
      >
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-400">Score final</span>
            </div>
            <p className="text-4xl font-bold text-white">{score}</p>
            <p className="text-gray-400">points</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400">Manches jouées</span>
            </div>
            <p className="text-4xl font-bold text-white">{round}</p>
            <p className="text-gray-400">manches</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <p className={`text-xl font-semibold ${performance.color}`}>
            {performance.message}
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
      >
        <RotateCcw className="w-5 h-5" />
        Nouvelle partie
      </motion.button>
    </motion.div>
  );
};

export default GameOverScreen;
