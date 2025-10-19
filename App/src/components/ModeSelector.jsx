
import React from 'react';
import { motion } from 'framer-motion';
import {Music, User, ArrowRight} from 'lucide-react';

const ModeSelector = ({ onSelectMode, isLoading }) => {
  const modes = [
    {
      id: 'lyrics',
      title: 'N\'oubliez pas les paroles',
      description: 'Complétez les paroles de rap français',
      icon: Music,
      color: 'from-purple-600 to-pink-600',
      points: '+10 points par bonne réponse'
    },
    {
      id: 'artist',
      title: 'Qui a dit ça ?',
      description: 'Devinez l\'artiste à partir de ses paroles',
      icon: User,
      color: 'from-blue-600 to-cyan-600',
      points: '+15 points par bonne réponse'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-4">
          🎤 Rap Game
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-bold">
          Choisissez votre mode de jeu
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {modes.map((mode, index) => {
          const IconComponent = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => !isLoading && onSelectMode(mode.id)}
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${mode.color}`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {mode.title}
                </h3>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {mode.description}
                </p>
                
                <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${mode.color} bg-opacity-20 border border-opacity-30`}>
                  <span className="text-sm font-semibold text-white">
                    {mode.points}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ModeSelector;
