import React from 'react';
import { motion } from 'framer-motion';
import {Send, User} from 'lucide-react';

const ArtistInput = ({ value, onChange, onSubmit, disabled, placeholder = "Nom de l'artiste..." }) => {
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
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-12 pr-16 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg disabled:opacity-50"
            autoComplete="off"
          />
          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">
          Tapez le nom du rappeur et appuyez sur Entrée
        </p>
      </div>
    </motion.div>
  );
};

export default ArtistInput;