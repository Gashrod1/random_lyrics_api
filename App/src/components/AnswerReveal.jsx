
import React from 'react';
import { motion } from 'framer-motion';
import {CheckCircle, XCircle, ArrowRight, Trophy} from 'lucide-react';

const AnswerReveal = ({ correctAnswer, userAnswer, isCorrect, onNextRound, onEndGame, round }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700"
    >
      <div className="text-center mb-6">
        {isCorrect ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-3 text-green-400 mb-4"
          >
            <CheckCircle className="w-8 h-8" />
            <span className="text-2xl font-bold">Bonne réponse !</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-3 text-red-400 mb-4"
          >
            <XCircle className="w-8 h-8" />
            <span className="text-2xl font-bold">Mauvaise réponse</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-700/50 p-4 rounded-xl">
          <p className="text-gray-400 text-sm mb-2">Votre réponse :</p>
          <p className="text-white text-lg">"{userAnswer}"</p>
        </div>
        
        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
          <p className="text-green-400 text-sm mb-2">Réponse correcte :</p>
          <p className="text-white text-lg font-semibold">"{correctAnswer}"</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {round < 10 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextRound}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            Manche suivante
          </motion.button>
        ) : null}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEndGame}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all"
        >
          <Trophy className="w-5 h-5" />
          Terminer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AnswerReveal;
