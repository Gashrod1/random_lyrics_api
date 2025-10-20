import requests
import json
import time
import re
import unicodedata
from difflib import SequenceMatcher

token = "86EtEqGDV_SeOtaFyy4g28JeYVJS9ht_XBEY77sjzgEJ8Ep-qrFR5Bs1IVWVHlV2"
HEADERS = {'Authorization': f'Bearer {token}'}


INPUT_FILE = "rappeurs_noms.json"
OUTPUT_FILE = "rappeurs.json"
CANDIDATES_FILE = "candidates.json"

def normalize_name(name: str) -> str:
    """Normalise un nom (minuscules, sans accents, caractères alphanum uniquement)."""
    name = unicodedata.normalize("NFD", name)
    name = "".join(ch for ch in name if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]", "", name.lower())

def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

def search_artist_candidates(artist_name: str, max_pages=5, per_page=10):
    """Recherche un artiste sur plusieurs pages pour éviter les faux négatifs."""
    all_hits = []
    for page in range(1, max_pages + 1):
        url = f"https://api.genius.com/search?q={requests.utils.requote_uri(artist_name)}&page={page}&per_page={per_page}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code != 200:
            print(f"❌ Erreur API ({resp.status_code}) à la page {page} pour {artist_name}")
            break

        data = resp.json()
        hits = data.get("response", {}).get("hits", [])
        if not hits:
            break

        all_hits.extend(hits)
        time.sleep(0.3)  # éviter le rate limit de l’API

    # Supprimer les doublons (même artiste plusieurs fois)
    unique_artists = {}
    for hit in all_hits:
        primary = hit["result"]["primary_artist"]
        unique_artists[primary["id"]] = {
            "name": primary["name"],
            "id": primary["id"],
            "url": primary["url"],
            "result_song_title": hit["result"].get("title"),
        }

    return list(unique_artists.values())

def pick_best_artist(artist_name: str, candidates: list, score_threshold=0.75):
    """Choisit le meilleur artiste parmi les candidats avec une stratégie robuste."""
    if not candidates:
        return None, 0.0, "no_candidates"

    norm_query = normalize_name(artist_name)

    # 1️⃣ Exact match
    for c in candidates:
        if normalize_name(c["name"]) == norm_query:
            return c, 1.0, "exact_match"

    # 2️⃣ Inclusion du nom (utile pour ex: "Booba" dans "Booba Officiel")
    for c in candidates:
        if norm_query in normalize_name(c["name"]):
            return c, 0.95, "partial_match"

    # 3️⃣ Fuzzy matching
    best, best_score = None, 0.0
    for c in candidates:
        score = similarity(norm_query, normalize_name(c["name"]))
        if score > best_score:
            best, best_score = c, score

    if best_score >= score_threshold:
        return best, best_score, "fuzzy_match"

    return best, best_score, "low_confidence"

def build_json_from_list(input_file=INPUT_FILE, output_file=OUTPUT_FILE, candidates_file=CANDIDATES_FILE):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    artists = data.get("top_20_rappeurs_francais", [])
    results, ambiguous = [], {}

    for name in artists:
        print(f"\n🔎 Recherche de : {name}")
        candidates = search_artist_candidates(name)
        print(f"   → {len(candidates)} candidats trouvés")

        best, score, reason = pick_best_artist(name, candidates)
        if best and reason != "low_confidence":
            results.append({"name": best["name"], "id": best["id"]})
            print(f"✅ {name} → {best['name']} (ID {best['id']}) [score={score:.2f}, reason={reason}]")
        else:
            ambiguous[name] = {
                "candidates": candidates,
                "best_guess": best,
                "score": score,
                "reason": reason,
            }
            print(f"⚠️ Ambigu pour {name} (score={score:.2f}) — vérifier manuellement.")

        time.sleep(0.5)  # anti-rate limit

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({"top_20_rappeurs_francais": results}, f, indent=2, ensure_ascii=False)

    with open(candidates_file, "w", encoding="utf-8") as f:
        json.dump(ambiguous, f, indent=2, ensure_ascii=False)

    print(f"\n✅ {len(results)} artistes trouvés correctement.")
    print(f"⚠️ {len(ambiguous)} cas ambigus sauvegardés dans {candidates_file}.")

if __name__ == "__main__":
    build_json_from_list()
