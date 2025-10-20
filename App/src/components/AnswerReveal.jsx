import React from 'react';
import { motion } from 'framer-motion';
import {CheckCircle, XCircle, Play, Star, Music} from 'lucide-react';

const AnswerReveal = ({ 
  correctAnswer, 
  userAnswer, 
  selectedArtist, 
  isCorrect, 
  onNextRound, 
  onEndGame, 
  round, 
  gameMode,
  songTitle,
  artistFound,
  songTitleGuessed 
}) => {
  const getResultIcon = () => {
    return isCorrect ? (
      <CheckCircle className="w-12 h-12 text-green-400" />
    ) : (
      <XCircle className="w-12 h-12 text-red-400" />
    );
  };

  const getResultText = () => {
    if (gameMode === 'artist') {
      if (artistFound && songTitleGuessed) {
        return "Parfait ! Artiste et titre trouvés !";
      } else if (artistFound) {
        return "Bien joué ! Artiste trouvé !";
      } else {
        return "Pas cette fois...";
      }
    }
    return isCorrect ? "Bonne réponse !" : "Pas tout à fait...";
  };

  const getResultColor = () => {
    if (gameMode === 'artist' && artistFound && songTitleGuessed) {
      return "text-yellow-400";
    }
    return isCorrect ? "text-green-400" : "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          {getResultIcon()}
        </motion.div>
        
        <h3 className={`text-2xl font-bold ${getResultColor()} mb-4`}>
          {getResultText()}
        </h3>

        {gameMode === 'artist' ? (
          <div className="space-y-4">
            {/* Informations sur l'artiste */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Artiste correct :</span>
              </div>
              <p className="text-white text-lg font-medium">{correctAnswer}</p>
            </div>

            {/* Informations sur le titre */}
            {songTitle && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">Titre de la chanson :</span>
                </div>
                <p className="text-white text-lg font-medium">{songTitle}</p>
              </div>
            )}

            {/* Résumé des réponses */}
            <div className="text-sm text-gray-400 space-y-1">
              {userAnswer && (
                <p>Votre première réponse : <span className="text-white">{userAnswer}</span></p>
              )}
              {selectedArtist && (
                <p>Votre choix multiple : <span className="text-white">{selectedArtist}</span></p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-cyan-300 font-semibold mb-2">Ligne correcte :</p>
              <p className="text-white text-lg">{correctAnswer}</p>
            </div>
            
            {userAnswer && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-300 font-semibold mb-2">Votre réponse :</p>
                <p className="text-gray-200">{userAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextRound}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          <Play className="w-5 h-5" />
          Continuer
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEndGame}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          Terminer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AnswerReveal;