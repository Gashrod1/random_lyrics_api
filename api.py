import time
from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup
import random
from pydantic import BaseModel
import json
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Lyrics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def random_rappeur_from_file():
    with open("rappeurs.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    rappeurs = data["top_20_rappeurs_francais"]
    rapper = random.choice(rappeurs)
    print(f"🎤 Rappeur choisi : {rapper['name']} (ID: {rapper['id']})")
    return rapper


def get_random_artists(exclude_artist=None, count=3):
    """Récupère des artistes aléatoirement depuis le fichier JSON"""
    with open("rappeurs.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    rappeurs = data["top_20_rappeurs_francais"]
    
    # Exclure l'artiste principal si spécifié
    if exclude_artist:
        rappeurs = [r for r in rappeurs if r["name"].lower() != exclude_artist.lower()]
    
    # Retourner un échantillon aléatoire
    return random.sample(rappeurs, min(count, len(rappeurs)))

# ------------------ CONFIG ------------------
token = "86EtEqGDV_SeOtaFyy4g28JeYVJS9ht_XBEY77sjzgEJ8Ep-qrFR5Bs1IVWVHlV2"
headers = {'Authorization': f'Bearer {token}'}

# Cache pour éviter plusieurs requêtes
lyrics_cache = {}

# ------------------ MODELS ------------------
class SongLineRequest(BaseModel):
    song_id: int
    current_line: str

# ------------------ FUNCTIONS ------------------

def get_lyrics_from_genius(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/127.0.0.0 Safari/537.36"
        )
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        return None
    soup = BeautifulSoup(resp.text, "html.parser")
    lyric_divs = soup.find_all("div", attrs={"data-lyrics-container": "true"})
    if not lyric_divs:
        lyric_divs = soup.find_all("div", class_=lambda c: c and c.startswith("Lyrics__Container-sc-"))
    lyrics = "\n".join(div.get_text(separator="\n") for div in lyric_divs)
    cleaned = [line.strip() for line in lyrics.splitlines() if line.strip()]
    return cleaned

def clean_lyrics_text(lyrics):
    """
    Nettoie les paroles :
    - Supprime tout avant la première ligne entre crochets
    - Supprime les lignes commençant par [
    - Supprime les parenthèses et leur contenu
    """
    # Trouver la première ligne contenant un crochet
    start_index = 0
    for i, line in enumerate(lyrics):
        if "[" in line and "]" in line:
            start_index = i
            break

    # On ne garde que les lignes à partir du premier crochet
    lyrics = lyrics[start_index:]

    cleaned = []
    for line in lyrics:
        # Ignorer les lignes qui commencent par un crochet
        if line.strip().startswith("["):
            continue
        # Supprimer les parenthèses et leur contenu
        line = re.sub(r"\(.*?\)", "", line)
        # Nettoyer les espaces et ignorer les lignes vides
        line = line.strip()
        if line:
            cleaned.append(line)

    return cleaned

def random_hit():
    rapper = random_rappeur_from_file()
    artist_id = rapper.get("id") if isinstance(rapper, dict) else None
    artist_name = rapper.get("name") if isinstance(rapper, dict) else rapper

    if not artist_id:
        print(f"❌ Aucun ID pour {artist_name}")
        return None

    print(f"🎤 Rappeur choisi : {artist_name} (ID: {artist_id})")

    # Récupérer les chansons de l'artiste
    songs = []
    page = 1
    while True:
        url = f"https://api.genius.com/artists/{artist_id}/songs?sort=popularity&per_page=50&page={page}"
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"❌ Erreur Genius ({response.status_code}) pour {artist_name}")
            break
        data = response.json()
        new_songs = data.get("response", {}).get("songs", [])
        if not new_songs:
            break
        songs.extend(new_songs)
        if not data["response"].get("next_page"):
            break
        page += 1
        time.sleep(0.3)  # éviter le rate limit

    if not songs:
        print(f"❌ Aucun titre trouvé pour {artist_name}")
        return None

    # 🔍 Filtrer les chansons "propres"
    def is_clean_title(title: str) -> bool:
        banned_words = ["remix", "instrumental", "livret"]
        if any(bad in title.lower() for bad in banned_words):
            return False
        if "[" in title and "]" in title :
            return False
        return True

    clean_songs = [s for s in songs if is_clean_title(s["title"])]

    if not clean_songs:
        print(f"⚠️ Aucun titre 'propre' trouvé pour {artist_name}, on prend quand même un titre brut.")
        clean_songs = songs

    song = random.choice(clean_songs)
    print(f"🎶 Titre choisi : {song['title']} ({artist_name})")
    return song


def random_punchline(song):
    lines = lyrics_cache.get(song['id'])
    if not lines:
        lyrics = clean_lyrics_text(get_lyrics_from_genius(song['url']))
        print(lyrics)
        if not lyrics:
            return None, []
        lyrics_cache[song['id']] = lyrics
        lines = lyrics
    if not lines:
        return None, lines
    
    # Choisir une ligne qui a au moins une ligne suivante
    valid_indices = [i for i in range(len(lines) - 1)]
    if not valid_indices:
        return None, lines
    
    start_idx = random.choice(valid_indices)
    return start_idx, lines

def next_line(song_id, current_line):
    lines = lyrics_cache.get(song_id)
    if not lines:
        return None
    if current_line in lines:
        idx = lines.index(current_line)
        if idx + 1 < len(lines):
            return lines[idx + 1]
    return None

def clean_punch(punch):
    return re.sub(r"\[.*?\]", "", punch).strip()

def get_answer_info(text):
    """Retourne des informations sur la réponse attendue"""
    words = text.split()
    letters = len(text.replace(" ", ""))
    return {
        "word_count": len(words),
        "letter_count": letters,
        "first_letter": text[0].upper() if text else "",
        "hint": f"{len(words)} mot{'s' if len(words) > 1 else ''}, {letters} lettre{'s' if letters > 1 else ''}"
    }

# ------------------ API ENDPOINTS ------------------
@app.get("/random_punchline")
def api_random_punchline():
    song = random_hit()
    if not song:
        raise HTTPException(status_code=404, detail="No song found")
    
    start_idx, all_lines = random_punchline(song)
    if start_idx is None:
        raise HTTPException(status_code=404, detail="No lyrics found")
    
    # Prendre 2 phrases consécutives
    first_line = clean_punch(all_lines[start_idx])
    second_line = clean_punch(all_lines[start_idx + 1]) if start_idx + 1 < len(all_lines) else ""
    
    # La ligne à deviner (3ème ligne)
    answer_line = ""
    if start_idx + 2 < len(all_lines):
        answer_line = clean_punch(all_lines[start_idx + 2])
    
    if not answer_line:
        raise HTTPException(status_code=404, detail="No answer line found")
    
    # Créer le punchline avec 2 phrases
    punchline = first_line
    if second_line:
        punchline += "\n" + second_line
    
    answer_info = get_answer_info(answer_line)
    
    return {
        "song_id": song["id"],
        "title": song["title"],
        "punchline": punchline,
        "next_line": answer_line,
        "artist": song["primary_artist"]["name"],
        "answer_info": answer_info
    }

@app.get("/random_quote")
def api_random_quote():
    song = random_hit()
    if not song:
        raise HTTPException(status_code=404, detail="No song found")
    
    start_idx, all_lines = random_punchline(song)
    if start_idx is None:
        raise HTTPException(status_code=404, detail="No lyrics found")
    
    # Générer 1-3 phrases consécutives
    num_lines = random.randint(1, 3)
    quote_lines = []
    
    for i in range(num_lines):
        if start_idx + i < len(all_lines):
            line = clean_punch(all_lines[start_idx + i])
            if line:  # Seulement ajouter les lignes non vides
                quote_lines.append(line)
    
    if not quote_lines:
        raise HTTPException(status_code=404, detail="No valid quote found")
    
    quote = "\n".join(quote_lines)
    correct_artist = song["primary_artist"]["name"]
    
    # Générer 3 autres artistes aléatoirement
    other_artists = get_random_artists(exclude_artist=correct_artist, count=3)
    
    # Créer la liste des options (4 au total)
    options = [correct_artist] + other_artists
    random.shuffle(options)  # Mélanger pour que la bonne réponse ne soit pas toujours en premier
    
    return {
        "song_id": song["id"],
        "title": song["title"],
        "quote": quote,
        "options": options,
        "correct_artist": correct_artist,
        "artist": song["primary_artist"]["name"]
    }

@app.post("/next_line")
def api_next_line(request: SongLineRequest):
    line = next_line(request.song_id, request.current_line)
    if line is None:
        raise HTTPException(status_code=404, detail="Next line not found")
    if "[" in line and "]" in line:
        api_next_line(request.song_id, request.line)
    return {"next_line": line}
