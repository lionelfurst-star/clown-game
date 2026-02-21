// Configuration du jeu
const config = {
    width: 800,
    height: 400,
    gravity: 1,
    jumpStrength: 18,
    fps: 60,
    gameDuration: 30,
    clownSize: { w: 50, h: 80 },
    pouleSize: { w: 40, h: 40 },
    oeufSize: { w: 30, h: 40 }
};

// État du jeu
let game = {
    canvas: null,
    ctx: null,
    isRunning: false,
    gameOver: false,
    gameOverEgg: false,
    score: 0,
    startTime: 0,
    
    clown: {
        x: 100,
        y: 50,
        velY: 0,
        onGround: true
    },
    
    poules: [],
    oeufs: [],
    spawnTimer: 0,
    
    keys: {
        left: false,
        right: false,
        space: false
    },
    
    gyro: {
        enabled: false,
        tilt: 0  // angle d'inclinaison
    },
    
    images: {},
    imagesLoaded: 0
};

// Chargement des images
function loadImages() {
    const imagesToLoad = {
        clown: 'clown_detour.png',
        poule: 'poule_detour.png',
        oeuf: 'oeuf_detour.png'
    };
    
    const totalImages = Object.keys(imagesToLoad).length;
    
    Object.entries(imagesToLoad).forEach(([key, src]) => {
        const img = new Image();
        img.onload = () => {
            game.imagesLoaded++;
            if (game.imagesLoaded === totalImages) {
                console.log('Toutes les images chargées');
            }
        };
        img.onerror = () => {
            console.warn(`Impossible de charger ${src}, utilisation de placeholder`);
            game.imagesLoaded++;
        };
        img.src = src;
        game.images[key] = img;
    });
}

// Initialisation
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Adapter au viewport mobile
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    loadImages();
    setupControls();
    
    // Bouton start
    document.getElementById('startBtn').addEventListener('click', startGame);
}

function resizeCanvas() {
    // Dimensions exactes disponibles
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Ratio du jeu (800x400 = 2:1)
    const gameRatio = config.width / config.height;
    const windowRatio = windowWidth / windowHeight;
    
    let newWidth, newHeight;
    
    if (windowRatio > gameRatio) {
        // Fenêtre plus large : on se base sur la hauteur
        newHeight = windowHeight;
        newWidth = newHeight * gameRatio;
    } else {
        // Fenêtre plus haute : on se base sur la largeur
        newWidth = windowWidth;
        newHeight = newWidth / gameRatio;
    }
    
    // Applique les dimensions calculées
    game.canvas.style.width = newWidth + 'px';
    game.canvas.style.height = newHeight + 'px';
    
    // Force le recalcul sur iOS
    game.canvas.width = config.width;
    game.canvas.height = config.height;
}

function setupControls() {
    // Clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            game.keys.space = true;
            if (game.clown.onGround && game.isRunning && !game.gameOver) {
                jump();
            }
        }
        if (e.code === 'ArrowLeft') game.keys.left = true;
        if (e.code === 'ArrowRight') game.keys.right = true;
        if (e.code === 'KeyR' && game.gameOver) resetGame();
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') game.keys.space = false;
        if (e.code === 'ArrowLeft') game.keys.left = false;
        if (e.code === 'ArrowRight') game.keys.right = false;
    });
    
    // Tactile - demander permission gyroscope sur iOS dès le premier tap
    game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        // Demander permission gyroscope sur iOS 13+ au premier tap
        if (typeof DeviceOrientationEvent.requestPermission === 'function' && !game.gyro.enabled) {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    console.log('Permission gyroscope:', response);
                    if (response === 'granted') {
                        enableGyroscope();
                    }
                })
                .catch(err => {
                    console.error('Erreur permission gyroscope:', err);
                });
        }
        
        if (game.clown.onGround && game.isRunning && !game.gameOver) {
            jump();
        } else if (game.gameOver) {
            resetGame();
        }
    });
    
    // Clic souris
    game.canvas.addEventListener('click', (e) => {
        if (game.clown.onGround && game.isRunning && !game.gameOver) {
            jump();
        } else if (game.gameOver) {
            resetGame();
        }
    });
    
    // Activer gyroscope automatiquement sur Android
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
            // Android ou iOS ancien - pas besoin de permission
            enableGyroscope();
        }
    }
}

function enableGyroscope() {
    console.log('Activation du gyroscope...');
    window.addEventListener('deviceorientation', (e) => {
        // gamma : inclinaison gauche/droite (-90 à 90)
        // Négatif = penché à gauche, Positif = penché à droite
        if (e.gamma !== null) {
            game.gyro.tilt = e.gamma;
            if (!game.gyro.enabled) {
                game.gyro.enabled = true;
                console.log('Gyroscope actif! Tilt:', e.gamma);
            }
        }
    });
}

function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    game.isRunning = true;
    game.startTime = Date.now();
    gameLoop();
}

function resetGame() {
    game.gameOver = false;
    game.gameOverEgg = false;
    game.score = 0;
    game.clown = {
        x: 100,
        y: 50,
        velY: 0,
        onGround: true
    };
    game.poules = [];
    game.oeufs = [];
    game.spawnTimer = 0;
    game.startTime = Date.now();
}

function jump() {
    game.clown.velY = config.jumpStrength;
    game.clown.onGround = false;
}

function spawnPoule() {
    game.poules.push({
        x: config.width,
        y: 50,
        speed: 4 + Math.random() * 4,
        velY: 0,
        onGround: true
    });
}

function update() {
    if (game.gameOver) return;
    
    // Timer
    const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
    const timeLeft = Math.max(0, config.gameDuration - elapsed);
    
    if (timeLeft === 0) {
        game.gameOver = true;
        return;
    }
    
    // Déplacement du clown
    if (game.keys.left) {
        game.clown.x -= 7;
    }
    if (game.keys.right) {
        game.clown.x += 7;
    }
    
    // Déplacement au gyroscope (iPad incliné)
    if (game.gyro.enabled) {
        // gamma entre -90 et 90
        // On utilise une zone morte de ±10° pour éviter le drift
        const deadZone = 10;
        let tilt = game.gyro.tilt;
        
        if (Math.abs(tilt) > deadZone) {
            // Normaliser l'angle (retirer la zone morte)
            if (tilt > 0) {
                tilt = tilt - deadZone;
            } else {
                tilt = tilt + deadZone;
            }
            
            // Vitesse proportionnelle à l'inclinaison (max ±15 px/frame)
            const maxTilt = 80 - deadZone;  // 80° max après zone morte
            const speed = (tilt / maxTilt) * 15;
            game.clown.x += speed;
        }
    }
    
    game.clown.x = Math.max(0, Math.min(config.width - config.clownSize.w, game.clown.x));
    
    // Gravité clown
    game.clown.velY -= config.gravity;
    game.clown.y += game.clown.velY;
    
    if (game.clown.y <= 50) {
        game.clown.y = 50;
        game.clown.velY = 0;
        game.clown.onGround = true;
    }
    
    // Spawn poules
    game.spawnTimer++;
    if (game.spawnTimer > 60) {
        spawnPoule();
        game.spawnTimer = 0;
    }
    
    // Update poules
    for (let i = game.poules.length - 1; i >= 0; i--) {
        const poule = game.poules[i];
        
        // Saut aléatoire
        if (poule.onGround && Math.random() < 0.01) {
            poule.velY = 12 + Math.random() * 4;
            poule.onGround = false;
        }
        
        // Gravité poule
        poule.velY -= config.gravity;
        poule.y += poule.velY;
        
        if (poule.y <= 50) {
            poule.y = 50;
            poule.velY = 0;
            poule.onGround = true;
        }
        
        poule.x -= poule.speed;
        
        // Suppression si hors écran
        if (poule.x + config.pouleSize.w < 0) {
            game.poules.splice(i, 1);
            continue;
        }
        
        // Collision avec clown
        const clownCenterX = game.clown.x + config.clownSize.w / 2;
        const pouleCenterX = poule.x + config.pouleSize.w / 2;
        
        if (game.clown.x < poule.x + config.pouleSize.w &&
            game.clown.x + config.clownSize.w > poule.x &&
            game.clown.y < poule.y + config.pouleSize.h &&
            game.clown.y + config.clownSize.h > poule.y &&
            game.clown.velY < 0 &&
            game.clown.y >= poule.y + config.pouleSize.h - 15 &&
            game.clown.y <= poule.y + config.pouleSize.h &&
            Math.abs(clownCenterX - pouleCenterX) < (config.clownSize.w + config.pouleSize.w) / 2) {
            game.score++;
            game.poules.splice(i, 1);
            continue;
        }
        
        // Pondre un œuf
        if (poule.onGround && Math.random() < 0.01) {
            game.oeufs.push({
                x: poule.x,
                y: 50,
                speed: 3 + Math.random() * 3,
                velY: 0
            });
        }
    }
    
    // Update œufs
    for (let i = game.oeufs.length - 1; i >= 0; i--) {
        const oeuf = game.oeufs[i];
        
        oeuf.x -= oeuf.speed;
        
        if (oeuf.y > 50) {
            oeuf.velY -= config.gravity;
            oeuf.y += oeuf.velY;
        } else {
            oeuf.y = 50;
            oeuf.velY = 0;
        }
        
        if (oeuf.x + config.oeufSize.w < 0) {
            game.oeufs.splice(i, 1);
            continue;
        }
        
        // Collision œuf
        const clownCenterX = game.clown.x + config.clownSize.w / 2;
        const oeufCenterX = oeuf.x + config.oeufSize.w / 2;
        
        if (game.clown.x < oeuf.x + config.oeufSize.w &&
            game.clown.x + config.clownSize.w > oeuf.x &&
            game.clown.y < oeuf.y + config.oeufSize.h &&
            game.clown.y + config.clownSize.h > oeuf.y &&
            game.clown.velY < 0 &&
            game.clown.y >= oeuf.y + config.oeufSize.h - 15 &&
            game.clown.y <= oeuf.y + config.oeufSize.h &&
            Math.abs(clownCenterX - oeufCenterX) < (config.clownSize.w + config.oeufSize.w) / 2) {
            game.gameOver = true;
            game.gameOverEgg = true;
        }
    }
}

function draw() {
    const ctx = game.ctx;
    
    // Fond cirque
    ctx.fillStyle = '#c74444';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Rayures jaunes
    ctx.fillStyle = '#ffc934';
    for (let i = 0; i < config.width; i += 80) {
        ctx.fillRect(i, 0, 40, config.height);
    }
    
    // Sol vert (en bas)
    ctx.fillStyle = '#63b563';
    ctx.fillRect(0, config.height - 50, config.width, 50);
    
    // Conversion Y pour canvas (Y=0 en haut dans canvas)
    const toCanvasY = (y, h) => config.height - y - h;
    
    // Clown
    const clownY = toCanvasY(game.clown.y, config.clownSize.h);
    if (game.images.clown && game.images.clown.complete) {
        ctx.drawImage(game.images.clown, game.clown.x, clownY, config.clownSize.w, config.clownSize.h);
    } else {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(game.clown.x, clownY, config.clownSize.w, config.clownSize.h);
    }
    
    // Poules
    game.poules.forEach(poule => {
        const pouleY = toCanvasY(poule.y, config.pouleSize.h);
        if (game.images.poule && game.images.poule.complete) {
            ctx.drawImage(game.images.poule, poule.x, pouleY, config.pouleSize.w, config.pouleSize.h);
        } else {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(poule.x, pouleY, config.pouleSize.w, config.pouleSize.h);
        }
    });
    
    // Œufs
    game.oeufs.forEach(oeuf => {
        const oeufY = toCanvasY(oeuf.y, config.oeufSize.h);
        if (game.images.oeuf && game.images.oeuf.complete) {
            ctx.drawImage(game.images.oeuf, oeuf.x, oeufY, config.oeufSize.w, config.oeufSize.h);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(oeuf.x, oeufY, config.oeufSize.w, config.oeufSize.h);
        }
    });
    
    // UI (coordonnées canvas : Y=0 en haut)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Score : ${game.score}`, 10, 35);
    
    const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
    const timeLeft = Math.max(0, config.gameDuration - elapsed);
    ctx.fillText(`Temps : ${timeLeft}s`, config.width - 210, 35);
    
    if (!game.gameOver) {
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Touche l\'écran : Sauter', 10, 65);
        
        // Indicateur gyroscope
        if (game.gyro.enabled) {
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`🎮 Gyro: ${Math.round(game.gyro.tilt)}°`, 10, 95);
        }
    }
    
    // Game Over
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, config.width, config.height);
        
        ctx.fillStyle = '#ffc934';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        
        if (game.gameOverEgg) {
            ctx.fillText('Game Over !', config.width / 2, config.height / 2 - 40);
            ctx.font = 'bold 36px Arial';
            ctx.fillText(`Score : ${game.score}`, config.width / 2, config.height / 2 + 10);
        } else {
            ctx.fillText('Temps écoulé !', config.width / 2, config.height / 2 - 40);
            ctx.font = 'bold 36px Arial';
            ctx.fillText(`Score final : ${game.score}`, config.width / 2, config.height / 2 + 10);
        }
        
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Touche l\'écran pour rejouer', config.width / 2, config.height / 2 + 60);
        ctx.textAlign = 'left';
    }
}

function gameLoop() {
    if (!game.isRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Démarrage
window.addEventListener('load', init);
