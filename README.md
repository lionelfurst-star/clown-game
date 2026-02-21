# 🤡 Clown & Chicken Game

Un jeu simple où un clown doit sauter sur des poules tout en évitant les œufs !

## 🎮 Comment jouer

### Sur ordinateur :
- **Espace** : Sauter
- **← →** : Déplacer le clown
- **R** : Rejouer (après game over)

### Sur iPad/Mobile :
- **Toucher l'écran** : Sauter et rejouer

## 🚀 Déploiement sur GitHub Pages

### 1. Créer un nouveau repo GitHub
```bash
cd "/Users/lionelfurst/My projects/Clown_and_chicken/web"
git init
git add .
git commit -m "Initial commit - Clown & Chicken game"
```

### 2. Créer le repo sur GitHub
1. Va sur https://github.com/new
2. Nomme le repo `clown-game` (ou autre nom)
3. **Ne pas** initialiser avec README
4. Copie l'URL du repo (ex: `https://github.com/TON-USERNAME/clown-game.git`)

### 3. Pusher le code
```bash
git remote add origin https://github.com/TON-USERNAME/clown-game.git
git branch -M main
git push -u origin main
```

### 4. Activer GitHub Pages
1. Va dans les **Settings** du repo
2. Dans le menu **Pages** (à gauche)
3. Sous **Source**, sélectionne `main` branch
4. Clique **Save**
5. Attends 1-2 minutes

### 5. Jouer !
Ton jeu sera accessible à : `https://TON-USERNAME.github.io/clown-game/`

## 🎯 Alternative : Jouer en local

### Option 1 - Serveur Python
```bash
cd "/Users/lionelfurst/My projects/Clown_and_chicken/web"
python3 -m http.server 8000
```
Puis ouvre : http://localhost:8000

### Option 2 - Double-clic
Ouvre directement `index.html` dans ton navigateur

### Option 3 - Depuis iPad (même WiFi)
1. Lance le serveur Python sur ton Mac
2. Trouve ton IP : `ifconfig | grep "inet "`
3. Sur iPad, ouvre Safari et va sur : `http://TON-IP:8000`

## 📱 Ajouter à l'écran d'accueil iPad

1. Ouvre le jeu dans Safari
2. Appuie sur le bouton **Partager** (carré avec flèche)
3. **Sur l'écran d'accueil**
4. C'est maintenant une vraie app ! 🎉

## 🎮 Règles du jeu

- Saute sur les **poules** pour marquer des points
- Évite de toucher les **œufs** au sol (Game Over !)
- Tu as **30 secondes** pour faire le meilleur score
- Les poules vont plus ou moins vite
- Certaines poules sautent aussi !
