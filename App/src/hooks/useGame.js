
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
const isAnswerAcceptable = (userAnswer, correctAnswer, threshold = 0.6) => {
  const userTrimmed = userAnswer.toLowerCase().trim();
  const correctTrimmed = correctAnswer.toLowerCase().trim();
  
  // Vérification de longueur : la réponse utilisateur doit faire au moins 40% de la longueur de la bonne réponse
  const minLength = Math.max(2, Math.floor(correctTrimmed.length * 0.4));
  if (userTrimmed.length < minLength) {
    return { isCorrect: false, similarity: 0, reason: 'too_short' };
  }
  
  // Vérification de longueur maximale : la réponse ne doit pas être plus de 2 fois plus longue
  const maxLength = correctTrimmed.length * 2;
  if (userTrimmed.length > maxLength) {
    return { isCorrect: false, similarity: 0, reason: 'too_long' };
  }
  
  const similarity = calculateSimilarity(userTrimmed, correctTrimmed);
  
  // Accepter si la similarité est >= seuil
  if (similarity >= threshold) return { isCorrect: true, similarity };
  
  // Vérifier si au moins 70% des mots importants sont présents
  const userWords = userTrimmed.split(/\s+/).filter(word => word.length > 2);
  const correctWords = correctTrimmed.split(/\s+/).filter(word => word.length > 2);
  
  if (correctWords.length === 0) {
    // Si pas de mots importants, utiliser seulement la similarité
    return { isCorrect: similarity >= 0.7, similarity };
  }
  
  const matchingWords = userWords.filter(word => 
    correctWords.some(correctWord => {
      // Vérifier que le mot fait au moins 40% de la longueur du mot correct
      if (word.length < Math.max(2, Math.floor(correctWord.length * 0.4))) {
        return false;
      }
      return correctWord.includes(word) || word.includes(correctWord) || 
             calculateSimilarity(word, correctWord) >= 0.7;
    })
  );
  
  const wordMatchRatio = matchingWords.length / correctWords.length;
  
  return { 
    isCorrect: wordMatchRatio >= 0.7 && similarity >= 0.5, 
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
    // Nouveaux états pour le mode artiste amélioré
    artistPhase: 'free_input', // 'free_input' | 'multiple_choice' | 'song_title'
    artistAttempts: 0, // Nombre d'essais pour l'artiste
    songTitleInput: '', // Input pour le titre de la chanson
    artistFound: false, // Si l'artiste a été trouvé
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
        artistPhase: 'free_input',
        artistAttempts: 0,
        songTitleInput: '',
        artistFound: false,
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
      if (gameState.artistPhase === 'free_input') {
        // Premier essai : saisie libre
        if (!gameState.userInput.trim()) return;
        
        const userAnswer = gameState.userInput.trim();
        const correctArtist = gameState.currentSong.correct_artist;
        
        const validation = isAnswerAcceptable(userAnswer, correctArtist, 0.7);
        
        if (validation.isCorrect) {
          // Artiste trouvé au premier essai
          let points = 20;
          if (validation.similarity >= 0.9) points = 25;
          else if (validation.similarity >= 0.8) points = 22;
          
          setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            artistFound: true,
            artistPhase: 'song_title'
          }));
          
          toast.success(`Excellent ! +${points} points. Bonus disponible !`);
        } else {
          // Artiste pas trouvé, passer au choix multiple
          setGameState(prev => ({
            ...prev,
            artistAttempts: 1,
            artistPhase: 'multiple_choice',
            userInput: ''
          }));
          
          if (validation.reason === 'too_short') {
            toast.error('Réponse trop courte ! Essayez avec les choix proposés.');
          } else if (validation.reason === 'too_long') {
            toast.error('Réponse trop longue ! Essayez avec les choix proposés.');
          } else {
            toast.error('Pas tout à fait... Essayez avec les choix proposés !');
          }
        }
      } else if (gameState.artistPhase === 'multiple_choice') {
        // Deuxième essai : choix multiple
        if (!gameState.selectedArtist) return;
        
        const isCorrect = gameState.selectedArtist === gameState.currentSong.correct_artist;
        
        if (isCorrect) {
          // Artiste trouvé au deuxième essai (moins de points)
          setGameState(prev => ({
            ...prev,
            score: prev.score + 10,
            artistFound: true,
            artistPhase: 'song_title'
          }));
          
          toast.success('Bonne réponse ! +10 points. Bonus disponible !');
        } else {
          // Artiste pas trouvé, fin du round
          setGameState(prev => ({
            ...prev,
            showAnswer: true,
            gameStatus: 'waiting'
          }));
          
          toast.error('Mauvaise réponse !');
        }
      } else if (gameState.artistPhase === 'song_title') {
        // Phase bonus : titre de la chanson
        if (!gameState.songTitleInput.trim()) {
          // Passer le bonus
          setGameState(prev => ({
            ...prev,
            showAnswer: true,
            gameStatus: 'waiting'
          }));
          return;
        }
        
        const userTitle = gameState.songTitleInput.trim();
        const correctTitle = gameState.currentSong.title;
        
        const validation = isAnswerAcceptable(userTitle, correctTitle, 0.6);
        
        if (validation.isCorrect) {
          let bonusPoints = 10;
          if (validation.similarity >= 0.9) bonusPoints = 15;
          else if (validation.similarity >= 0.8) bonusPoints = 12;
          
          setGameState(prev => ({
            ...prev,
            score: prev.score + bonusPoints,
            showAnswer: true,
            gameStatus: 'waiting'
          }));
          
          toast.success(`Titre trouvé ! +${bonusPoints} points bonus !`);
        } else {
          setGameState(prev => ({
            ...prev,
            showAnswer: true,
            gameStatus: 'waiting'
          }));
          
          if (validation.reason === 'too_short') {
            toast.error('Titre trop court ! Essayez d\'être plus précis.');
          } else if (validation.reason === 'too_long') {
            toast.error('Titre trop long ! Essayez d\'être plus concis.');
          } else {
            toast.error('Titre incorrect, mais bien joué pour l\'artiste !');
          }
        }
      }
    } else {
      // Mode "N'oubliez pas les paroles" (inchangé)
      if (!gameState.userInput.trim()) return;
      
      const userAnswer = gameState.userInput.trim();
      const correctAnswer = gameState.currentSong.next_line.trim();
      
      const validation = isAnswerAcceptable(userAnswer, correctAnswer);
      
      if (validation.isCorrect) {
        let points = 10;
        if (validation.similarity >= 0.9) points = 15;
        else if (validation.similarity >= 0.8) points = 12;
        else if (validation.similarity >= 0.7) points = 10;
        else points = 8;
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          showAnswer: true,
          gameStatus: 'waiting'
        }));
        
        if (validation.similarity >= 0.9) {
          toast.success(`Parfait ! +${points} points`);
        } else if (validation.similarity >= 0.8) {
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
        
        if (validation.reason === 'too_short') {
          toast.error('Réponse trop courte ! Essayez d\'ajouter plus de mots.');
        } else if (validation.reason === 'too_long') {
          toast.error('Réponse trop longue ! Essayez d\'être plus concis.');
        } else {
          toast.error('Pas tout à fait... Essayez encore !');
        }
      }
    }
  }, [gameState.currentSong, gameState.userInput, gameState.selectedArtist, gameState.gameMode, gameState.artistPhase, gameState.songTitleInput]);

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
        artistPhase: 'free_input',
        artistAttempts: 0,
        songTitleInput: '',
        artistFound: false,
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

  const updateSongTitleInput = useCallback((input) => {
    setGameState(prev => ({ ...prev, songTitleInput: input }));
  }, []);

  const skipSongTitle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showAnswer: true,
      gameStatus: 'waiting'
    }));
    toast.info('Bonus passé !');
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
    updateSongTitleInput,
    skipSongTitle,
    endGame,
  };
};
