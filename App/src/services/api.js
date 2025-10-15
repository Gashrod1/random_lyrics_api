
import axios from 'axios';

// Configuration de l'API - remplacez par l'URL de votre API Python
const API_BASE_URL = 'http://127.0.0.1:8000/'; // Changez selon votre configuration

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const lyricsApi = {
  getRandomPunchline: async () => {
    const response = await api.get('/random_punchline');
    return response.data;
  },

  getNextLine: async (request) => {
    const response = await api.post('/next_line', request);
    return response.data;
  },
};
