from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup
import random
from pydantic import BaseModel
import json
import re

app = FastAPI(title="Lyrics API")

def random_rappeur_from_file():
    # Ouvrir et lire le fichier JSON
    with open("rappeurs.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Récupérer la liste des rappeurs
    rappeurs = data["top_20_rappeurs_francais"]
    
    # Retourner un nom aléatoire
    rapper = random.choice(rappeurs)
    print(f"Rappeur choisi : {rapper}")
    return rapper

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
    # Ignore les premières lignes avec crochets
    start_index = 0
    for i, line in enumerate(lyrics):
        if line.strip().startswith("["):
            start_index = i + 1
            break
    return lyrics[start_index:]

def random_hit():
    query = random_rappeur_from_file()
    url = f"https://api.genius.com/search?q={query}"
    response = requests.get(url, headers=headers)
    data = response.json()
    hits = data['response']['hits']
    if not hits:
        return None
    return random.choice(hits)["result"]

def random_punchline(song):
    lines = lyrics_cache.get(song['id'])
    if not lines:
        lyrics = clean_lyrics_text(get_lyrics_from_genius(song['url']))
        if not lyrics:
            return None, []
        lyrics_cache[song['id']] = lyrics
        lines = lyrics
    if not lines:
        return None, lines
    return random.choice(lines), lines

def next_line(song_id, current_line):
    lines = lyrics_cache.get(song_id)
    if not lines:
        return None
    if current_line in lines:
        idx = lines.index(current_line)
        if idx + 1 < len(lines):
            return lines[idx + 1]
    return None
# ------------------ API ENDPOINTS ------------------
@app.get("/random_punchline")
def api_random_punchline():
    song = random_hit()
    if not song:
        raise HTTPException(status_code=404, detail="No song found")
    
    punch, all_lines = random_punchline(song)
    if not punch:
        raise HTTPException(status_code=404, detail="No lyrics found")
    
    # Mettre à jour la punchline avec la version nettoyée
    punch_cleaned = re.sub(r"\[.*?\]", "", punch).strip()
    
    return {
        "song_id": song["id"],
        "title": song["title"],
        "punchline": punch_cleaned,
        "next_line": next_line(song["id"], punch),
    }

@app.post("/next_line")
def api_next_line(request: SongLineRequest):
    line = next_line(request.song_id, request.current_line)
    if line is None:
        raise HTTPException(status_code=404, detail="Next line not found")
    if "[" in line and "]" in line:
        api_next_line(request.song_id, request.line)
    return {"next_line": line}
 