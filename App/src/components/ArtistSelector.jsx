
import React from 'react';
import { motion } from 'framer-motion';
import {Check} from 'lucide-react';

const ArtistSelector = ({ options, selectedArtist, onSelectArtist, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h3 className="text-xl font-semibold text-white mb-6 text-center">
        Qui a dit ça ?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((artist, index) => (
          <motion.button
            key={artist}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onSelectArtist(artist)}
            disabled={disabled}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedArtist === artist
                ? 'border-purple-500 bg-purple-500 bg-opacity-20 text-white'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{artist}</span>
              {selectedArtist === artist && (
                <Check className="w-5 h-5 text-purple-400" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ArtistSelector;
