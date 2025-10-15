
import React from 'react';
import { motion } from 'framer-motion';
import {Play, Music, Zap} from 'lucide-react';

const StartScreen = ({ onStart, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-6">
          🎤 N'oubliez pas les paroles
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 font-bold">
          Édition Rap Français
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Comment jouer ?</h2>
        
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <Music className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">1. Écoutez</h3>
              <p className="text-gray-300">Une punchline de rap français vous est présentée</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">2. Devinez</h3>
              <p className="text-gray-300">Tapez la suite des paroles de la chanson</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Play className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">3. Marquez</h3>
              <p className="text-gray-300">Gagnez 10 points par bonne réponse !</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        disabled={isLoading}
        className="inline-flex items-center gap-3 px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl"
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Commencer le jeu
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default StartScreen;
