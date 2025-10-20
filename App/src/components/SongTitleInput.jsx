import React from 'react';
import { motion } from 'framer-motion';
import {Send, Music, Star} from 'lucide-react';

const SongTitleInput = ({ value, onChange, onSubmit, onSkip, disabled }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6 rounded-xl border border-yellow-500/20 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <h4 className="text-lg font-semibold text-yellow-300">Question Bonus</h4>
        </div>
        <p className="text-gray-200">
          Vous avez trouvé l'artiste ! Maintenant, pouvez-vous deviner le titre de cette chanson ?
        </p>
        <p className="text-yellow-300 text-sm mt-2">
          +10 points bonus si vous trouvez le titre !
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Music className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Titre de la chanson..."
            disabled={disabled}
            className="w-full pl-12 pr-16 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all text-lg disabled:opacity-50"
            autoComplete="off"
          />
          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
      
      <div className="flex justify-center mt-4">
        <motion.button
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Passer cette question →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SongTitleInput;