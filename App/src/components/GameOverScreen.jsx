
import React from 'react';
import { motion } from 'framer-motion';
import {Trophy, RotateCcw, Star, Music, User} from 'lucide-react';

const GameOverScreen = ({ score, round, onRestart, gameMode }) => {
  const getScoreMessage = () => {
    if (score >= 150) return { text: "Maître du rap français ! 🔥", color: "text-yellow-400" };
    if (score >= 100) return { text: "Expert en rap ! 🎤", color: "text-purple-400" };
    if (score >= 50) return { text: "Bon connaisseur ! 👏", color: "text-blue-400" };
    return { text: "Continue à écouter ! 💪", color: "text-green-400" };
  };

  const scoreMessage = getScoreMessage();
  
  const modeConfig = {
    lyrics: { icon: Music, label: 'N\'oubliez pas les paroles' },
    artist: { icon: User, label: 'Qui a dit ça ?' }
  };

  const config = modeConfig[gameMode] || modeConfig.lyrics;
  const IconComponent = config.icon;

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
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
          Partie terminée !
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <IconComponent className="w-5 h-5 text-gray-400" />
          <p className="text-gray-400 text-lg">Mode : {config.label}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{score}</div>
            <div className="text-gray-400">Points</div>
          </div>
          
          <div className="text-center">
            <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{round}</div>
            <div className="text-gray-400">Manches</div>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              %
            </div>
            <div className="text-3xl font-bold text-white">
              {round > 0 ? Math.round((score / (round * (gameMode === 'artist' ? 15 : 10))) * 100) : 0}%
            </div>
            <div className="text-gray-400">Réussite</div>
          </div>
        </div>

        <div className={`text-2xl font-bold ${scoreMessage.color} mb-4`}>
          {scoreMessage.text}
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="inline-flex items-center gap-3 px-8 py-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl"
      >
        <RotateCcw className="w-6 h-6" />
        Rejouer
      </motion.button>
    </motion.div>
  );
};

export default GameOverScreen;
