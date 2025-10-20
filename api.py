import time
import re
import json
import random
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from pydantic import BaseModel

# ------------------ CONFIG ------------------
TOKEN = "86EtEqGDV_SeOtaFyy4g28JeYVJS9ht_XBEY77sjzgEJ8Ep-qrFR5Bs1IVWVHlV2"
HEADERS = {'Authorization': f'Bearer {TOKEN}'}
GENIUS_API = "https://api.genius.com"
session = requests.Session()  # réutilise les connexions HTTP

# ------------------ APP ------------------
app = FastAPI(title="Lyrics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ CACHE ------------------
lyrics_cache = {}   # song_id -> [lyrics]
songs_cache = {}    # artist_id -> [songs]
with open("rappeurs.json", "r", encoding="utf-8") as f:
    RAPPEURS_DATA = json.load(f)["top_20_rappeurs_francais"]

# ------------------ MODELS ------------------
class SongLineRequest(BaseModel):
    song_id: int
    current_line: str

# ------------------ HELPERS ------------------
def random_rappeur():
    """Retourne un rappeur aléatoire du cache local"""
    rapper = random.choice(RAPPEURS_DATA)
    print(f"🎤 {rapper['name']} (ID: {rapper['id']})")
    return rapper

def filter_clean_songs(songs):
    """Écarte les titres [Livret], (Live), Remix, etc."""
    banned = ["remix", "instrumental", "livret", "freestyle", "version", "live"]
    clean = []
    for s in songs:
        title = s["title"].lower()
        if any(b in title for b in banned):
            continue
        if "[" in title or "(" in title:
            continue
        clean.append(s)
    return clean or songs  # fallback si tout est filtré

def get_artist_songs(artist_id):
    """Récupère et met en cache les chansons d’un artiste Genius"""
    if artist_id in songs_cache:
        return songs_cache[artist_id]

    all_songs = []
    page = 1
    while True:
        url = f"{GENIUS_API}/artists/{artist_id}/songs?sort=popularity&per_page=50&page={page}"
        resp = session.get(url, headers=HEADERS)
        if resp.status_code != 200:
            break
        data = resp.json()["response"]
        new = data.get("songs", [])
        if not new:
            break
        all_songs.extend(new)
        if not data.get("next_page"):
            break
        page += 1
        time.sleep(0.2)

    songs_cache[artist_id] = all_songs
    return all_songs

def get_lyrics_from_genius(url):
    """Scrape les paroles depuis Genius"""
    resp = session.get(url, headers={
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/127.0.0.0 Safari/537.36"
        )
    })
    if resp.status_code != 200:
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    lyric_divs = soup.find_all("div", attrs={"data-lyrics-container": "true"}) \
        or soup.find_all("div", class_=lambda c: c and c.startswith("Lyrics__Container"))
    text = "\n".join(div.get_text(separator="\n") for div in lyric_divs)
    return [l.strip() for l in text.splitlines() if l.strip()]

def clean_lyrics_text(lyrics):
    """Supprime les balises, crochets, parenthèses, etc."""
    start_index = 0
    for i, line in enumerate(lyrics):
        if "[" in line and "]" in line:
            start_index = i
            break
    lyrics = lyrics[start_index:]
    cleaned = []
    for line in lyrics:
        if line.strip().startswith("["):
            continue
        line = re.sub(r"\(.*?\)", "", line).strip()
        if line:
            cleaned.append(line)
    return cleaned

def clean_punch(punch):
    return re.sub(r"\[.*?\]", "", punch).strip()

# ------------------ LOGIQUE JEU ------------------
def random_hit():
    rapper = random_rappeur()
    songs = get_artist_songs(rapper["id"])
    if not songs:
        return None
    valid = filter_clean_songs(songs)
    song = random.choice(valid)
    print(f"🎶 {song['title']} ({rapper['name']})")
    return song

def random_punchline(song):
    """Retourne un index aléatoire et les lignes de paroles"""
    if song["id"] not in lyrics_cache:
        lyrics = get_lyrics_from_genius(song["url"])
        lyrics = clean_lyrics_text(lyrics)
        lyrics_cache[song["id"]] = lyrics
    lines = lyrics_cache[song["id"]]
    if len(lines) < 2:
        return None, []
    return random.randint(0, len(lines) - 2), lines

def next_line(song_id, current_line):
    lines = lyrics_cache.get(song_id)
    if not lines:
        return None
    if current_line in lines:
        idx = lines.index(current_line)
        return lines[idx + 1] if idx + 1 < len(lines) else None
    return None

def get_answer_info(text):
    words = text.split()
    letters = len(text.replace(" ", ""))
    return {
        "word_count": len(words),
        "letter_count": letters,
        "first_letter": text[0].upper() if text else "",
        "hint": f"{len(words)} mot{'s' if len(words) > 1 else ''}, {letters} lettre{'s' if letters > 1 else ''}"
    }

# ------------------ ENDPOINTS ------------------
@app.get("/random_punchline")
def api_random_punchline():
    song = random_hit()
    if not song:
        raise HTTPException(404, "No song found")
    start, lines = random_punchline(song)
    if start is None:
        raise HTTPException(404, "No lyrics found")

    first = clean_punch(lines[start])
    second = clean_punch(lines[start + 1]) if start + 1 < len(lines) else ""
    answer = clean_punch(lines[start + 2]) if start + 2 < len(lines) else ""

    if not answer:
        raise HTTPException(404, "No answer line found")

    punchline = "\n".join([l for l in [first, second] if l])
    return {
        "song_id": song["id"],
        "title": song["title"],
        "artist": song["primary_artist"]["name"],
        "punchline": punchline,
        "next_line": answer,
        "answer_info": get_answer_info(answer),
    }

@app.get("/random_quote")
def api_random_quote():
    song = random_hit()
    if not song:
        raise HTTPException(404, "No song found")
    start, lines = random_punchline(song)
    if start is None:
        raise HTTPException(404, "No lyrics found")

    quote = "\n".join(clean_punch(lines[start + i]) for i in range(random.randint(1, 3)) if start + i < len(lines))
    correct = song["primary_artist"]["name"]
    others = [r["name"] for r in get_random_artists(exclude_artist=correct, count=3)]
    options = [correct] + others
    random.shuffle(options)
    return {
        "song_id": song["id"],
        "title": song["title"],
        "quote": quote,
        "options": options,
        "correct_artist": correct,
    }

@app.post("/next_line")
def api_next_line(req: SongLineRequest):
    nxt = next_line(req.song_id, req.current_line)
    if not nxt:
        raise HTTPException(404, "Next line not found")
    return {"next_line": nxt}

def get_random_artists(exclude_artist=None, count=3):
    pool = [r for r in RAPPEURS_DATA if r["name"].lower() != (exclude_artist or "").lower()]
    return random.sample(pool, min(count, len(pool)))
