
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useGame } from './hooks/useGame';
import GameHeader from './components/GameHeader';
import ModeSelector from './components/ModeSelector';
import SongCard from './components/SongCard';
import QuoteCard from './components/QuoteCard';
import GameInput from './components/GameInput';
import ArtistSelector from './components/ArtistSelector';
import AnswerReveal from './components/AnswerReveal';
import GameOverScreen from './components/GameOverScreen';

function App() {
  const {
    gameState,
    startNewGame,
    submitAnswer,
    nextRound,
    updateUserInput,
    updateSelectedArtist,
    endGame,
  } = useGame();

  const renderGameContent = () => {
    switch (gameState.gameStatus) {
      case 'idle':
        return (
          <ModeSelector 
            onSelectMode={startNewGame} 
            isLoading={gameState.isLoading}
          />
        );
        
      case 'playing':
        return (
          <div className="max-w-4xl mx-auto">
            <GameHeader 
              score={gameState.score} 
              round={gameState.round} 
              gameMode={gameState.gameMode}
            />
            
            {gameState.gameMode === 'artist' ? (
              // Mode "Qui a dit ça ?"
              gameState.currentSong && (
                <>
                  <QuoteCard quote={gameState.currentSong} />
                  <ArtistSelector
                    options={gameState.artistOptions}
                    selectedArtist={gameState.selectedArtist}
                    onSelectArtist={updateSelectedArtist}
                    disabled={gameState.isLoading}
                  />
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitAnswer}
                      disabled={gameState.isLoading || !gameState.selectedArtist}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {gameState.isLoading ? 'Chargement...' : 'Valider'}
                    </motion.button>
                  </div>
                </>
              )
            ) : (
              // Mode "N'oubliez pas les paroles"
              gameState.currentSong && (
                <>
                  <SongCard song={gameState.currentSong} />
                  <GameInput
                    value={gameState.userInput}
                    onChange={updateUserInput}
                    onSubmit={submitAnswer}
                    disabled={gameState.isLoading}
                    isLoading={gameState.isLoading}
                  />
                </>
              )
            )}
          </div>
        );
        
      case 'waiting':
        return (
          <div className="max-w-4xl mx-auto">
            <GameHeader 
              score={gameState.score} 
              round={gameState.round} 
              gameMode={gameState.gameMode}
            />
            {gameState.currentSong && gameState.showAnswer && (
              <AnswerReveal
                correctAnswer={gameState.gameMode === 'artist' 
                  ? gameState.currentSong.correct_artist 
                  : gameState.currentSong.next_line
                }
                userAnswer={gameState.userInput}
                selectedArtist={gameState.selectedArtist}
                isCorrect={gameState.gameMode === 'artist' 
                  ? gameState.selectedArtist === gameState.currentSong.correct_artist
                  : gameState.currentSong.next_line.toLowerCase().includes(gameState.userInput.toLowerCase())
                }
                onNextRound={nextRound}
                onEndGame={endGame}
                round={gameState.round}
                gameMode={gameState.gameMode}
              />
            )}
          </div>
        );
        
      case 'finished':
        return (
          <GameOverScreen
            score={gameState.score}
            round={gameState.round}
            onRestart={() => startNewGame(gameState.gameMode)}
            gameMode={gameState.gameMode}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {renderGameContent()}
        </motion.div>
      </div>
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
}

export default App;
