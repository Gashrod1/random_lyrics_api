# 🎵 French Rap Punchline API

Une petite API FastAPI qui retourne des punchlines aléatoires issues de morceaux de rap français (ex: Damso) en utilisant l'API Genius et du scraping des paroles.

---

# 🚀 Installation

```bash
pip install -r requirements.txt
```

```bash
python -m uvicorn api:app --reload
```

# 🔗 Routes disponibles
## GET /random_punchline

Renvoie une punchline aléatoire tirée d’un morceau.

```json
{
  "song_id": 123456,
  "title": "Feu de bois",
  "punchline": "T'étais ma femme, t'étais ma go, t'étais ma pote",
}
```

## POST /next_line
Renvoie la ligne suivante d’une chanson, à partir de la ligne actuelle.
**Body (JSON) :**

```json
{
  "song_id": 123456,
  "current_line": "T'étais ma femme, t'étais ma go, t'étais ma pote"
}
```
**Exemple de réponse**

```json
{
  "next_line": "T'étais mon seul repère, j'étais ton sale gosse"
}
```

# Application web | N'oubliez pas les paroles  

Web app qui exploite l'api.

# Prérequis 

```bash
python -m uvicorn api:app --reload
```

# Lancer l'application web sur un autre terminal

'''
npm install
'''

'''
npm run dev
'''





