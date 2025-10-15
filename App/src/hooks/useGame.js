
import { useState, useCallback } from 'react';
import { lyricsApi } from '../services/api';
import toast from 'react-hot-toast';

export const useGame = () => {
  const [gameState, setGameState] = useState({
    currentSong: null,
    score: 0,
    round: 1,
    gameStatus: 'idle', // 'idle' | 'playing' | 'waiting' | 'finished'
    userInput: '',
    showAnswer: false,
    isLoading: false,
  });

  const startNewGame = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    try {
      const song = await lyricsApi.getRandomPunchline();
      setGameState({
        currentSong: song,
        score: 0,
        round: 1,
        gameStatus: 'playing',
        userInput: '',
        showAnswer: false,
        isLoading: false,
      });
      toast.success('Nouvelle partie commencée !');
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      toast.error('Erreur lors du chargement de la chanson');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const submitAnswer = useCallback(() => {
    if (!gameState.currentSong || !gameState.userInput.trim()) return;

    const userAnswer = gameState.userInput.toLowerCase().trim();
    const correctAnswer = gameState.currentSong.next_line.toLowerCase().trim();
    
    // Vérification simple de similarité
    const isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
    
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        showAnswer: true,
        gameStatus: 'waiting'
      }));
      toast.success('Bonne réponse ! +10 points');
    } else {
      setGameState(prev => ({
        ...prev,
        showAnswer: true,
        gameStatus: 'waiting'
      }));
      toast.error('Mauvaise réponse !');
    }
  }, [gameState.currentSong, gameState.userInput]);

  const nextRound = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    try {
      const song = await lyricsApi.getRandomPunchline();
      setGameState(prev => ({
        ...prev,
        currentSong: song,
        round: prev.round + 1,
        gameStatus: 'playing',
        userInput: '',
        showAnswer: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement de la prochaine chanson:', error);
      toast.error('Erreur lors du chargement de la chanson');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateUserInput = useCallback((input) => {
    setGameState(prev => ({ ...prev, userInput: input }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStatus: 'finished' }));
  }, []);

  return {
    gameState,
    startNewGame,
    submitAnswer,
    nextRound,
    updateUserInput,
    endGame,
  };
};
