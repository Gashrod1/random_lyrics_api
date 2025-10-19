
import React from 'react';
import { motion } from 'framer-motion';
import {User, Music2, HelpCircle} from 'lucide-react';

const SongCard = ({ song }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Music2 className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">{song.title}</h3>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-gray-400" />
        <p className="text-lg text-gray-300">{song.artist}</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20 mb-6">
        <div className="text-lg text-gray-200 leading-relaxed italic whitespace-pre-line">
          "{song.punchline}"
        </div>
      </div>
      
      {/* Informations sur la réponse */}
      {song.answer_info && (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-xl border border-blue-500/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-semibold">Indice :</span>
          </div>
          <p className="text-blue-200">
            {song.answer_info.hint}
          </p>
          <p className="text-blue-300 text-sm mt-1">
            Commence par : "{song.answer_info.first_letter}"
          </p>
        </div>
      )}
      
      <div className="text-center">
        <p className="text-purple-300 font-semibold">
          Quelle est la suite ? 🎤
        </p>
      </div>
    </motion.div>
  );
};

export default SongCard;
