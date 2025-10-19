
import { useState, useCallback } from 'react';
import { lyricsApi } from '../services/api';
import toast from 'react-hot-toast';

// Fonction pour calculer la similarité entre deux chaînes
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Si les chaînes sont identiques
  if (s1 === s2) return 1;
  
  // Si l'une contient l'autre
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calculer la distance de Levenshtein normalisée
  const matrix = [];
  const len1 = s1.length;
  const len2 = s2.length;
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  return 1 - (distance / maxLength);
};

// Fonction pour vérifier si la réponse est acceptable
const isAnswerAcceptable = (userAnswer, correctAnswer) => {
  const similarity = calculateSimilarity(userAnswer, correctAnswer);
  
  // Accepter si la similarité est >= 60%
  if (similarity >= 0.6) return { isCorrect: true, similarity };
  
  // Vérifier si au moins 70% des mots importants sont présents
  const userWords = userAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const correctWords = correctAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  if (correctWords.length === 0) return { isCorrect: false, similarity };
  
  const matchingWords = userWords.filter(word => 
    correctWords.some(correctWord => 
      correctWord.includes(word) || word.includes(correctWord) || 
      calculateSimilarity(word, correctWord) >= 0.7
    )
  );
  
  const wordMatchRatio = matchingWords.length / correctWords.length;
  
  return { 
    isCorrect: wordMatchRatio >= 0.7 || similarity >= 0.5, 
    similarity: Math.max(similarity, wordMatchRatio) 
  };
};

export const useGame = () => {
  const [gameState, setGameState] = useState({
    currentSong: null,
    score: 0,
    round: 1,
    gameStatus: 'idle', // 'idle' | 'playing' | 'waiting' | 'finished'
    userInput: '',
    showAnswer: false,
    isLoading: false,
    gameMode: 'lyrics', // 'lyrics' | 'artist'
    artistOptions: [], // Pour le mode "Qui a dit ça ?"
    selectedArtist: '',
  });

  const startNewGame = useCallback(async (mode = 'lyrics') => {
    setGameState(prev => ({ ...prev, isLoading: true, gameMode: mode }));
    try {
      let gameData;
      if (mode === 'artist') {
        gameData = await lyricsApi.getRandomQuote();
      } else {
        gameData = await lyricsApi.getRandomPunchline();
      }
      
      setGameState({
        currentSong: gameData,
        score: 0,
        round: 1,
        gameStatus: 'playing',
        userInput: '',
        showAnswer: false,
        isLoading: false,
        gameMode: mode,
        artistOptions: gameData.options || [],
        selectedArtist: '',
      });
      
      const modeText = mode === 'artist' ? 'Qui a dit ça ?' : 'N\'oubliez pas les paroles';
      toast.success(`Nouvelle partie ${modeText} commencée !`);
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      toast.error('Erreur lors du chargement du contenu');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const submitAnswer = useCallback(() => {
    if (!gameState.currentSong) return;

    if (gameState.gameMode === 'artist') {
      if (!gameState.selectedArtist) return;
      
      const isCorrect = gameState.selectedArtist === gameState.currentSong.correct_artist;
      
      if (isCorrect) {
        setGameState(prev => ({
          ...prev,
          score: prev.score + 15,
          showAnswer: true,
          gameStatus: 'waiting'
        }));
        toast.success('Bonne réponse ! +15 points');
      } else {
        setGameState(prev => ({
          ...prev,
          showAnswer: true,
          gameStatus: 'waiting'
        }));
        toast.error('Mauvaise réponse !');
      }
    } else {
      if (!gameState.userInput.trim()) return;
      
      const userAnswer = gameState.userInput.trim();
      const correctAnswer = gameState.currentSong.next_line.trim();
      
      const { isCorrect, similarity } = isAnswerAcceptable(userAnswer, correctAnswer);
      
      if (isCorrect) {
        // Points basés sur la précision
        let points = 10;
        if (similarity >= 0.9) points = 15; // Très précis
        else if (similarity >= 0.8) points = 12; // Assez précis
        else if (similarity >= 0.7) points = 10; // Correct
        else points = 8; // Acceptable
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          showAnswer: true,
          gameStatus: 'waiting'
        }));
        
        if (similarity >= 0.9) {
          toast.success(`Parfait ! +${points} points`);
        } else if (similarity >= 0.8) {
          toast.success(`Très bien ! +${points} points`);
        } else {
          toast.success(`Bonne réponse ! +${points} points`);
        }
      } else {
        setGameState(prev => ({
          ...prev,
          showAnswer: true,
          gameStatus: 'waiting'
        }));
        toast.error('Pas tout à fait... Essayez encore !');
      }
    }
  }, [gameState.currentSong, gameState.userInput, gameState.selectedArtist, gameState.gameMode]);

  const nextRound = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    try {
      let gameData;
      if (gameState.gameMode === 'artist') {
        gameData = await lyricsApi.getRandomQuote();
      } else {
        gameData = await lyricsApi.getRandomPunchline();
      }
      
      setGameState(prev => ({
        ...prev,
        currentSong: gameData,
        round: prev.round + 1,
        gameStatus: 'playing',
        userInput: '',
        showAnswer: false,
        isLoading: false,
        artistOptions: gameData.options || [],
        selectedArtist: '',
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du contenu suivant:', error);
      toast.error('Erreur lors du chargement du contenu');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [gameState.gameMode]);

  const updateUserInput = useCallback((input) => {
    setGameState(prev => ({ ...prev, userInput: input }));
  }, []);

  const updateSelectedArtist = useCallback((artist) => {
    setGameState(prev => ({ ...prev, selectedArtist: artist }));
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
    updateSelectedArtist,
    endGame,
  };
};
