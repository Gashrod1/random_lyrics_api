import React from 'react';
import { motion } from 'framer-motion';
import {Quote, Music2} from 'lucide-react';

const QuoteCard = ({ quote, gamePhase }) => {
  const getTitle = () => {
    switch (gamePhase) {
      case 'free_input':
        return "Qui a dit ça ?";
      case 'multiple_choice':
        return "Choisissez parmi ces artistes :";
      case 'song_title':
        return "Bonus : Quel est le titre de cette chanson ?";
      default:
        return "Qui a dit ça ?";
    }
  };

  const getInstruction = () => {
    switch (gamePhase) {
      case 'free_input':
        return "Tapez le nom du rappeur 🎤";
      case 'multiple_choice':
        return "Sélectionnez la bonne réponse 🎯";
      case 'song_title':
        return "Devinez le titre pour gagner des points bonus ! 🏆";
      default:
        return "Quel rappeur a dit ces paroles ? 🎤";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Quote className="w-6 h-6 text-cyan-400" />
        <h3 className="text-2xl font-bold text-white">{getTitle()}</h3>
      </div>
      
      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6 rounded-xl border border-cyan-500/20">
        <div className="text-lg text-gray-200 leading-relaxed italic whitespace-pre-line">
          "{quote.quote}"
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-cyan-300 font-semibold">
          {getInstruction()}
        </p>
      </div>
    </motion.div>
  );
};

export default QuoteCard;