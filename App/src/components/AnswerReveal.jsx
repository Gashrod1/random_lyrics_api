
import React from 'react';
import { motion } from 'framer-motion';
import {CheckCircle, XCircle, ArrowRight, Trophy} from 'lucide-react';

const AnswerReveal = ({ 
  correctAnswer, 
  userAnswer, 
  isCorrect, 
  onNextRound, 
  onEndGame, 
  round,
  gameMode,
  selectedArtist 
}) => {
  const maxRounds = 10;
  const isLastRound = round >= maxRounds;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          {isCorrect ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
          <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse !'}
          </h3>
        </div>

        <div className="space-y-4">
          {gameMode === 'artist' ? (
            <>
              <div className="text-gray-300">
                <span className="font-semibold">Votre réponse :</span>{' '}
                <span className={selectedArtist === correctAnswer ? 'text-green-400' : 'text-red-400'}>
                  {selectedArtist || 'Aucune sélection'}
                </span>
              </div>
              <div className="text-gray-300">
                <span className="font-semibold">Bonne réponse :</span>{' '}
                <span className="text-green-400 font-bold">{correctAnswer}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-300">
                <span className="font-semibold">Votre réponse :</span>{' '}
                <span className="text-yellow-400">"{userAnswer}"</span>
              </div>
              <div className="text-gray-300">
                <span className="font-semibold">Bonne réponse :</span>{' '}
                <span className="text-green-400 font-bold">"{correctAnswer}"</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {!isLastRound ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextRound}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            Manche suivante
          </motion.button>
        ) : null}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEndGame}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          <Trophy className="w-5 h-5" />
          {isLastRound ? 'Voir le score final' : 'Terminer le jeu'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AnswerReveal;
