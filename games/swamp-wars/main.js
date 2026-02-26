const SERVER_BASE = 'wss://influence-arena-server.m2clawdbot.workers.dev';
const LOG_ENDPOINT = 'https://influence-arena-server.m2clawdbot.workers.dev/log';

const ARENA_WIDTH = 1600;
const ARENA_HEIGHT = 900;

const KENNEY_TERRAIN = parseCsv(`
2,2,2,1,58,1,2,2,1,1,1,1,3,3,1,1,1,3,2,2,58,2,2,3,1,2,1,1,1,1,
3,3,3,2,58,3,1,1,1,1,2,1,2,1,2,3,1,1,1,1,58,1,2,2,1,1,1,1,2,1,
1,2,4,74,23,1,1,1,2,2,2,2,1,3,1,3,1,1,1,3,58,1,1,3,2,1,2,1,1,1,
2,1,58,1,1,1,1,1,3,2,2,2,2,1,1,1,1,2,1,1,58,2,1,1,1,1,1,3,2,1,
2,1,58,1,1,2,1,1,1,1,1,1,1,1,3,1,1,19,20,20,76,20,21,1,1,3,1,1,3,2,
1,1,58,1,1,1,2,2,1,1,1,1,1,1,1,1,1,37,38,38,38,38,92,20,21,1,1,1,1,1,
1,2,22,74,74,74,5,2,3,2,1,1,1,1,1,2,1,55,56,94,38,38,38,38,39,2,1,1,1,1,
1,1,1,1,1,1,58,1,2,1,2,2,1,2,1,1,2,1,1,37,38,38,38,38,39,1,1,3,2,1,
2,1,1,2,1,1,58,2,1,2,1,1,1,1,1,1,1,1,1,55,56,56,56,56,57,2,1,1,1,2,
3,1,1,2,1,2,58,1,2,1,1,3,2,1,1,1,1,1,1,1,1,3,1,3,1,1,1,1,1,1,
20,20,20,20,20,20,76,20,21,1,3,2,2,1,1,1,1,1,2,3,1,3,1,1,1,1,1,1,2,1,
38,38,38,38,38,38,38,38,39,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,2,
38,38,38,38,38,38,38,38,92,20,20,20,20,20,21,1,1,1,1,1,1,1,3,1,1,1,2,3,1,3,
38,38,38,38,38,38,38,38,38,38,38,38,38,38,39,2,1,1,1,2,1,1,1,1,1,1,2,2,2,2,
56,56,56,56,56,94,38,38,38,38,38,38,38,38,92,20,20,21,1,1,3,2,2,1,1,2,1,3,1,2,
1,2,2,1,1,37,38,38,38,38,38,38,38,38,38,38,38,39,1,3,2,2,1,1,3,3,1,1,2,1,
2,1,2,1,2,37,38,38,38,38,38,38,38,38,38,38,38,39,3,1,2,1,1,1,1,1,1,2,2,1
`);

const KENNEY_OBJECTS = parseCsv(`
0,0,6,0,0,0,145,0,0,0,145,95,95,113,113,95,113,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,145,95,0,0,145,0,95,113,95,113,113,0,95,0,0,0,0,0,0,0,6,0,95,0,
0,0,0,0,0,0,145,0,0,113,145,113,113,113,113,95,0,0,0,0,0,0,0,95,6,0,0,6,0,95,
0,0,0,0,0,0,146,111,111,111,148,0,113,95,0,50,0,0,0,6,0,0,0,0,95,95,0,95,0,0,
111,111,131,111,111,111,166,0,0,0,145,0,0,0,0,0,6,0,0,0,0,0,0,0,0,113,113,0,0,0,
0,0,0,0,0,0,0,0,0,0,145,0,48,0,12,0,0,0,0,0,0,0,0,0,0,95,113,95,0,0,
95,0,0,0,0,0,0,0,110,111,165,111,129,111,112,0,113,113,0,0,0,0,0,0,0,0,113,113,95,113,
113,95,95,0,95,0,0,0,0,0,0,0,145,0,0,0,0,95,95,0,0,0,0,0,0,113,95,113,95,113,
0,113,113,113,113,0,0,0,0,0,0,0,145,0,0,113,113,113,82,0,0,0,0,0,0,95,95,113,113,0,
0,95,113,0,0,0,0,13,0,0,128,111,148,0,0,0,95,0,0,0,0,0,0,0,95,113,113,95,0,0,
0,0,0,0,0,0,0,0,0,6,145,0,164,111,111,129,111,111,111,130,0,113,95,113,113,113,95,0,0,0,
0,0,0,0,0,0,0,0,0,0,145,0,0,0,0,145,0,0,0,145,0,113,95,89,0,113,113,0,95,0,
0,0,0,0,0,0,0,0,0,0,167,0,0,0,0,145,0,81,0,164,111,111,129,111,112,95,0,113,0,0,
0,0,0,0,0,0,0,0,0,0,164,131,131,131,131,166,6,0,81,0,0,113,145,89,0,0,0,113,0,0,
0,0,0,0,0,0,0,0,0,0,0,149,149,149,149,0,0,0,0,0,0,0,145,113,0,6,0,0,0,95,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,145,0,6,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,145,0,0,0,0,113,0,0
`);

const KENNEY_UI = parseCsv(`
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,183,0,0,0,0,0,0,0,0,183,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,80,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,80,42,43,61,0,0,0,188,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,80,80,80,62,80,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,80,80,80,80,80,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,188,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
`);

function parseCsv(text) {
  return text
    .trim()
    .split('\n')
    .map(row => row.split(',').filter(Boolean).map(v => parseInt(v, 10)));
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0A0E1A',
  resolution: window.devicePixelRatio || 1,
  render: { antialias: true },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

let cursors;
let wasd;
let playerId;
let socket;
let players = new Map();
let projectiles = new Map();
let muzzleFlashes = [];
let scores = { red: 0, blue: 0 };
let scoreText;
let timerText;
let classText;
let scoreRedEl;
let scoreBlueEl;
let hitParticles = [];
let lastScoreRed = 0;
let lastScoreBlue = 0;
let zone;
let zoneText;
let zoneLockoutText;
let dashReady = true;
let statusEl;
let cameraLocked = false;
let touchMove = { active: false, x: 0, y: 0 };
let joystickId = null;
let selectedClass = 'gator';
let obstacles = [];
let lastInputSent = 0;
let audioCtx;
let ambientOsc;
let ambientGain;
let roomCode = 'global';
let lastHitFlash = new Map();
let isHost = false;
let mode = 'online';
let searchTimer;
let playerName = (localStorage.getItem('swampwars_name') || '').trim();
let clientId = localStorage.getItem('swampwars_cid');
if (!clientId) {
  clientId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  localStorage.setItem('swampwars_cid', clientId);
}
let isReady = false;
let countdownEl;

function preload() {
  this.load.image('behemoth', 'assets/behemoth.svg');
  this.load.image('gator', 'assets/gator.svg');
  this.load.image('lizard', 'assets/lizard.svg');
  this.load.image('cobra', 'assets/cobra.svg');
  this.load.image('kenneyTiles', 'assets/kenney/tilemap.png');
}

function create() {
  this.physics.world.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  this.cameras.main.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  updateCameraZoom(this.cameras.main);
  this.cameras.main.setLerp(0.08, 0.08);

  // Kenney tilemap field
  const tileScale = 3;
  const mapOriginX = 800 - (30 * 16 * tileScale) / 2;
  const mapOriginY = 450 - (17 * 16 * tileScale) / 2;

  const terrain = this.make.tilemap({ data: KENNEY_TERRAIN, tileWidth: 16, tileHeight: 16 });
  const tiles = terrain.addTilesetImage('kenneyTiles', null, 16, 16, 1, 1);
  const terrainLayer = terrain.createLayer(0, tiles, mapOriginX, mapOriginY);
  terrainLayer.setScale(tileScale);

  const objects = this.make.tilemap({ data: KENNEY_OBJECTS, tileWidth: 16, tileHeight: 16 });
  const objTiles = objects.addTilesetImage('kenneyTiles', null, 16, 16, 1, 1);
  const objectLayer = objects.createLayer(0, objTiles, mapOriginX, mapOriginY);
  objectLayer.setScale(tileScale);

  const uiMap = this.make.tilemap({ data: KENNEY_UI, tileWidth: 16, tileHeight: 16 });
  const uiTiles = uiMap.addTilesetImage('kenneyTiles', null, 16, 16, 1, 1);
  const uiLayer = uiMap.createLayer(0, uiTiles, mapOriginX, mapOriginY);
  uiLayer.setScale(tileScale);

  const decoMap = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 30, height: 17 });
  const decoTiles = decoMap.addTilesetImage('kenneyTiles', null, 16, 16, 1, 1);
  const decoLayer = decoMap.createBlankLayer('decor', decoTiles, mapOriginX, mapOriginY);
  decoLayer.setScale(tileScale);

  // Rows of trees at obstacle rectangles
  const treeTiles = [145, 146, 149, 150, 151];
  const obstacleRects = [
    { x: 520, y: 260, w: 120, h: 80 },
    { x: 1080, y: 260, w: 120, h: 80 },
    { x: 520, y: 640, w: 120, h: 80 },
    { x: 1080, y: 640, w: 120, h: 80 },
    { x: 800, y: 160, w: 220, h: 60 },
    { x: 800, y: 740, w: 220, h: 60 },
    { x: 320, y: 450, w: 90, h: 180 },
    { x: 1280, y: 450, w: 90, h: 180 }
  ];

  obstacleRects.forEach((o) => {
    const startX = Math.floor((o.x - o.w / 2 - mapOriginX) / (16 * tileScale));
    const endX = Math.ceil((o.x + o.w / 2 - mapOriginX) / (16 * tileScale));
    const startY = Math.floor((o.y - o.h / 2 - mapOriginY) / (16 * tileScale));
    const endY = Math.ceil((o.y + o.h / 2 - mapOriginY) / (16 * tileScale));
    for (let tx = startX; tx <= endX; tx++) {
      for (let ty = startY; ty <= endY; ty++) {
        const tile = treeTiles[Math.floor(Math.random() * treeTiles.length)];
        decoLayer.putTileAt(tile, tx, ty);
      }
    }
  });

  zone = this.add.circle(800, 450, 110, 0x1f5b8f, 0.35).setStrokeStyle(2, 0x38a3ff);
  zoneText = this.add.text(800, 450, 'INFLUENCE', {
    fontFamily: 'Oswald',
    fontSize: '20px',
    color: '#f0a830'
  }).setOrigin(0.5);
  zoneLockoutText = this.add.text(800, 480, '', {
    fontFamily: 'Oswald',
    fontSize: '14px',
    color: '#ffffff'
  }).setOrigin(0.5);

  scoreText = this.add.text(24, 24, 'Red 0 — 0 Blue', {
    fontFamily: 'Inter',
    fontSize: '16px',
    color: '#ffffff'
  }).setScrollFactor(0);
  timerText = this.add.text(24, 48, 'Time 3:00', {
    fontFamily: 'Inter',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)'
  }).setScrollFactor(0);
  classText = this.add.text(24, 68, 'Class: Swamp Gator', {
    fontFamily: 'Inter',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)'
  }).setScrollFactor(0);

  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,S,D');

  this.input.keyboard.on('keydown-SPACE', () => {
    if (!dashReady || !socket || socket.readyState !== 1) return;
    initAudio();
    dashReady = false;
    const dir = getMoveVector();
    if (dir.length() === 0) return;
    socket.send(JSON.stringify({ type: 'dash' }));
    playSound('dash');
    this.time.delayedCall(800, () => {
      dashReady = true;
    });
  });

  this.input.keyboard.on('keydown-E', () => {
    if (!socket || socket.readyState !== 1) return;
    initAudio();
    socket.send(JSON.stringify({ type: 'special' }));
    playSound('special');
  });

  this.input.keyboard.on('keydown-ONE', () => selectClass('behemoth', 'Bureaucrat Behemoth'));
  this.input.keyboard.on('keydown-TWO', () => selectClass('gator', 'Swamp Gator'));
  this.input.keyboard.on('keydown-THREE', () => selectClass('lizard', 'Lobbyist Lizard'));
  this.input.keyboard.on('keydown-FOUR', () => selectClass('cobra', 'Corruption Cobra'));

  this.input.on('pointerdown', (pointer) => {
    if (!socket || socket.readyState !== 1) return;
    initAudio();
    const scene = game.scene.scenes[0];
    const worldPoint = pointer.positionToCamera(scene.cameras.main);
    const me = players.get(playerId);
    if (!me) return;
    const dir = { x: worldPoint.x - me.sprite.x, y: worldPoint.y - me.sprite.y };
    socket.send(JSON.stringify({ type: 'fire', dir }));
    playSound('shoot');
  });

  statusEl = document.getElementById('status');
  setupUi();
  setupTouchControls();

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    updateCameraZoom(this.cameras.main);
  });
}

function updateCameraZoom(camera) {
  const viewW = game.scale.width || window.innerWidth;
  const viewH = game.scale.height || window.innerHeight;
  const zoom = Math.max(2, viewW / ARENA_WIDTH, viewH / ARENA_HEIGHT);
  camera.setZoom(zoom);
}

function update() {
  const now = performance.now();

  // particle updates
  if (hitParticles.length) {
    for (let i = hitParticles.length - 1; i >= 0; i--) {
      const p = hitParticles[i];
      p.life -= 16;
      p.vy += 0.03;
      p.x += p.vx;
      p.y += p.vy;
      p.sprite.setPosition(p.x, p.y);
      p.sprite.setAlpha(Math.max(0, p.life / 300));
      if (p.life <= 0) {
        p.sprite.destroy();
        hitParticles.splice(i, 1);
      }
    }
  }

  if (!socket || socket.readyState !== 1) return;
  if (now - lastInputSent < 50) return; // 20Hz
  lastInputSent = now;
  const move = getMoveVector();
  socket.send(JSON.stringify({ type: 'input', input: { x: move.x, y: move.y } }));
}

function connectSocket() {
  const url = `${SERVER_BASE}?room=${encodeURIComponent(roomCode)}&mode=${mode}${isHost ? '&host=1' : ''}&cid=${encodeURIComponent(clientId)}`;
  socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    updateStatus(mode === 'offline' ? 'Offline' : 'Online', 'online');
    logEvent('socket_open');
    if (playerName) {
      socket.send(JSON.stringify({ type: 'name', name: playerName }));
    }
    if (mode === 'custom') {
      socket.send(JSON.stringify({ type: 'ready', ready: isReady }));
    }
    if (mode === 'offline') {
      socket.send(JSON.stringify({ type: 'start' }));
    }
  });

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'welcome') {
      playerId = payload.id;
      if (payload.player && payload.player.name) {
        playerName = payload.player.name;
      }
      if (payload.obstacles) {
        obstacles = payload.obstacles;
        drawObstacles();
      }
      if (payload.hostId) {
        isHost = payload.hostId === playerId;
      }
    }
    if (payload.type === 'state') {
      scores = payload.scores;
      if (timerText) {
        const seconds = Math.max(0, Math.floor(payload.matchTime || 0));
        const m = Math.floor(seconds / 60);
        const s = `${seconds % 60}`.padStart(2, '0');
        timerText.setText(`Time ${m}:${s}`);
      }
      const humansCount = payload.humans ?? payload.players.filter(p => !p.isBot).length;
      updateStatus(`${mode === 'offline' ? 'Offline' : 'Online'} • ${payload.players.length} players`, 'online');

      if (!payload.started) {
        clearPlayers();
        clearProjectiles();
        updateLobbyRoster(payload.players);
        window._lobbyAllReady = payload.players.filter(p => !p.isBot).every(p => p.ready);
        updateLobbyUi(payload.players.length, payload.started, payload.hostId, humansCount, payload.full);
        setTouchControls(false);
        if (countdownEl) {
          if (payload.countdown > 0) {
            countdownEl.textContent = `Starting in ${payload.countdown}`;
            countdownEl.classList.add('show');
          } else {
            countdownEl.classList.remove('show');
          }
        }
        if (window._ui?.scoreboard) window._ui.scoreboard.classList.remove('active');
        if (mode === 'online' && window._searching) {
          window._searchingCount = humansCount;
          const ui = window._ui;
          if (ui && ui.searchCount) ui.searchCount.textContent = `Humans: ${window._searchingCount} / 4`;
        }
        return;
      }

      if (countdownEl) countdownEl.classList.remove('show');
      updateLobbyUi(payload.players.length, payload.started, payload.hostId, humansCount, payload.full);
      setTouchControls(true);
      if (window._ui?.scoreboard) window._ui.scoreboard.classList.add('active');
      if (payload.zone) {
        zone.setPosition(payload.zone.x, payload.zone.y);
        zoneText.setPosition(payload.zone.x, payload.zone.y);
        zoneLockoutText.setPosition(payload.zone.x, payload.zone.y + 26);
      }
      if (zoneLockoutText) {
        zoneLockoutText.setText(payload.zoneLockout > 0 ? `LOCKED ${payload.zoneLockout}` : '');
      }

      syncPlayers(payload.players);
      syncProjectiles(payload.projectiles || []);
      const redScore = Math.floor(scores.red);
      const blueScore = Math.floor(scores.blue);
      scoreText.setText(`Red ${redScore} — ${blueScore} Blue`);
      if (scoreRedEl) {
        scoreRedEl.textContent = `Red ${redScore}`;
        if (redScore > lastScoreRed) {
          scoreRedEl.classList.add('pulse');
          setTimeout(() => scoreRedEl.classList.remove('pulse'), 300);
        }
      }
      if (scoreBlueEl) {
        scoreBlueEl.textContent = `Blue ${blueScore}`;
        if (blueScore > lastScoreBlue) {
          scoreBlueEl.classList.add('pulse');
          setTimeout(() => scoreBlueEl.classList.remove('pulse'), 300);
        }
      }
      lastScoreRed = redScore;
      lastScoreBlue = blueScore;
      if (payload.matchOver) {
        const winner = scores.red === scores.blue ? 'DRAW' : (scores.red > scores.blue ? 'RED WINS' : 'BLUE WINS');
        showWinner(winner);
        const ui = window._ui;
        if (ui?.summary && ui.summaryTitle && ui.summaryScore) {
          ui.summaryTitle.textContent = winner;
          ui.summaryScore.textContent = `Red ${Math.floor(scores.red)} — ${Math.floor(scores.blue)} Blue`;
          ui.summary.classList.remove('hidden');
        }
        setTouchControls(false);
      }
    }
    if (payload.type === 'full') {
      showHomeNotice('Game Full');
      returnToHome();
      return;
    }
  });

  socket.addEventListener('close', (e) => {
    updateStatus('Offline', 'offline');
    logEvent('socket_close', { code: e.code, reason: e.reason });
  });

  socket.addEventListener('error', () => {
    logEvent('socket_error');
  });
}

function setupUi() {
  const home = document.getElementById('home');
  const characterScreen = document.getElementById('characterScreen');
  const customScreen = document.getElementById('customScreen');
  const matchLobby = document.getElementById('matchLobby');
  const searching = document.getElementById('searching');
  const searchCount = document.getElementById('searchCount');
  const gameEl = document.getElementById('game');
  const hud = document.getElementById('hud');
  const homeNotice = document.getElementById('homeNotice');
  const specialBtn = document.getElementById('specialBtn');
  const fireBtn = document.getElementById('fireBtn');
  const joystick = document.getElementById('joystick');
  const nameInput = document.getElementById('playerName');
  const scoreboard = document.getElementById('scoreboard');
  const summary = document.getElementById('summary');
  const summaryTitle = document.getElementById('summaryTitle');
  const summaryScore = document.getElementById('summaryScore');
  const summaryBack = document.getElementById('summaryBack');
  scoreRedEl = document.getElementById('scoreRed');
  scoreBlueEl = document.getElementById('scoreBlue');
  countdownEl = document.getElementById('countdown');

  const playOnline = document.getElementById('playOnline');
  const offlinePlay = document.getElementById('offlinePlay');
  const customLobby = document.getElementById('customLobby');
  const swapCharacter = document.getElementById('swapCharacter');

  const createRoom = document.getElementById('createRoom');
  const joinRoom = document.getElementById('joinRoom');
  const joinRow = document.getElementById('joinRow');
  const joinSubmit = document.getElementById('joinSubmit');
  const roomInput = document.getElementById('roomInput');
  const customBack = document.getElementById('customBack');

  const startMatch = document.getElementById('startMatch');
  const readyToggle = document.getElementById('readyToggle');
  const lobbyList = document.getElementById('lobbyList');
  const roomLabel = document.getElementById('roomLabel');
  const playersCount = document.getElementById('playersCount');
  const humansCount = document.getElementById('humansCount');

  const cards = characterScreen.querySelectorAll('.card');
  const done = document.getElementById('characterDone');

  window._ui = { home, characterScreen, customScreen, matchLobby, searching, searchCount, gameEl, hud, homeNotice, roomLabel, playersCount, humansCount, startMatch, readyToggle, lobbyList, nameInput, scoreboard, specialBtn, fireBtn, joystick, summary, summaryTitle, summaryScore, summaryBack };

  if (nameInput) {
    if (playerName) nameInput.value = playerName;
    nameInput.addEventListener('input', () => {
      playerName = nameInput.value.trim().slice(0, 16);
      localStorage.setItem('swampwars_name', playerName);
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify({ type: 'name', name: playerName }));
      }
    });
  }

  playOnline.addEventListener('click', () => {
    mode = 'online';
    roomCode = 'global';
    isHost = false;
    isReady = true;
    if (summary) summary.classList.add('hidden');
    startSearch();
  });

  offlinePlay.addEventListener('click', () => {
    mode = 'offline';
    roomCode = `offline-${Math.random().toString(36).slice(2, 8)}`;
    isHost = true;
    isReady = true;
    if (summary) summary.classList.add('hidden');
    startLobby();
  });

  customLobby.addEventListener('click', () => {
    home.classList.add('hidden');
    customScreen.classList.remove('hidden');
    if (summary) summary.classList.add('hidden');
  });

  swapCharacter.addEventListener('click', () => {
    home.classList.add('hidden');
    characterScreen.classList.remove('hidden');
    if (summary) summary.classList.add('hidden');
  });

  createRoom.addEventListener('click', () => {
    mode = 'custom';
    roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    isHost = true;
    isReady = false;
    roomLabel.textContent = `Room: ${roomCode}`;
    startLobby();
  });

  joinRoom.addEventListener('click', () => {
    joinRow.classList.toggle('hidden');
  });

  joinSubmit.addEventListener('click', () => {
    const code = roomInput.value.trim().toUpperCase();
    if (!code) return;
    mode = 'custom';
    roomCode = code;
    isHost = false;
    isReady = false;
    roomLabel.textContent = `Room: ${roomCode}`;
    startLobby();
  });

  customBack.addEventListener('click', () => {
    customScreen.classList.add('hidden');
    home.classList.remove('hidden');
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const classId = card.dataset.class;
      const label = card.querySelector('h4').textContent;
      selectClass(classId, label);
    });
  });
  if (cards[1]) cards[1].classList.add('active');

  done.addEventListener('click', () => {
    characterScreen.classList.add('hidden');
    home.classList.remove('hidden');
    if (summary) summary.classList.add('hidden');
  });

  if (readyToggle) {
    readyToggle.addEventListener('click', () => {
      isReady = !isReady;
      readyToggle.textContent = isReady ? 'Ready ✓' : 'Ready Up';
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify({ type: 'ready', ready: isReady }));
      }
    });
  }

  startMatch.addEventListener('click', () => {
    if (!socket || socket.readyState !== 1) return;
    socket.send(JSON.stringify({ type: 'start' }));
    matchLobby.classList.add('hidden');
  });

  if (summaryBack) {
    summaryBack.addEventListener('click', () => {
      if (summary) summary.classList.add('hidden');
      returnToHome();
    });
  }

  function startSearch() {
    home.classList.add('hidden');
    searching.classList.remove('hidden');
    gameEl.classList.remove('hidden');
    hud.classList.add('active');
    setTouchControls(false);
    if (scoreboard) scoreboard.classList.remove('active');
    connectSocket();
    window._searching = true;
    window._searchingCount = 0;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (window._searchingCount >= 2) {
        socket.send(JSON.stringify({ type: 'start' }));
        searching.classList.add('hidden');
      } else {
        showHomeNotice('Not enough online');
        returnToHome();
      }
      window._searching = false;
    }, 30000);
  }

  function startLobby() {
    home.classList.add('hidden');
    customScreen.classList.add('hidden');
    characterScreen.classList.add('hidden');
    if (mode === 'offline') {
      matchLobby.classList.add('hidden');
    } else {
      matchLobby.classList.remove('hidden');
    }
    gameEl.classList.remove('hidden');
    hud.classList.add('active');
    setTouchControls(false);
    if (scoreboard) scoreboard.classList.remove('active');
    connectSocket();
  }
}

function updateLobbyUi(count, started, hostId, humans, full) {
  const ui = window._ui;
  if (!ui) return;
  ui.playersCount.textContent = `Players: ${count}`;
  ui.humansCount.textContent = `Humans: ${humans} / 4`;
  window._lastHumans = humans;

  if (full) {
    showHomeNotice('Game Full');
    returnToHome();
    return;
  }

  if (started) {
    ui.matchLobby.classList.add('hidden');
    ui.searching.classList.add('hidden');
  } else {
    if (mode === 'custom') ui.matchLobby.classList.remove('hidden');
    if (mode === 'offline') ui.matchLobby.classList.add('hidden');
  }

  if (mode === 'custom') {
    if (ui.readyToggle) {
      ui.readyToggle.classList.remove('hidden');
      ui.readyToggle.textContent = isReady ? 'Ready ✓' : 'Ready Up';
    }

    if (ui.startMatch) {
      const allReady = window._lobbyAllReady === true;
      if (playerId && hostId === playerId) {
        ui.startMatch.disabled = !allReady;
        ui.startMatch.textContent = allReady ? 'Start Match' : 'Waiting for ready…';
      } else {
        ui.startMatch.disabled = true;
        ui.startMatch.textContent = 'Waiting for host…';
      }
    }
  } else if (ui.readyToggle) {
    ui.readyToggle.classList.add('hidden');
  }
}

function returnToHome() {
  if (socket) socket.close();
  const ui = window._ui;
  if (!ui) return;
  ui.home.classList.remove('hidden');
  ui.customScreen.classList.add('hidden');
  ui.characterScreen.classList.add('hidden');
  ui.matchLobby.classList.add('hidden');
  ui.searching.classList.add('hidden');
  ui.gameEl.classList.add('hidden');
  ui.hud.classList.remove('active');
  setTouchControls(false);
  if (ui.scoreboard) ui.scoreboard.classList.remove('active');
  if (ui.summary) ui.summary.classList.add('hidden');
  stopAmbient();
}

function setTouchControls(on) {
  if (window._touchUi) {
    window._touchUi.setActive(on);
    return;
  }
  const ui = window._ui;
  if (!ui) return;
  const method = on ? 'add' : 'remove';
  if (ui.joystick) ui.joystick.classList[method]('active');
  if (ui.fireBtn) ui.fireBtn.classList[method]('active');
  if (ui.specialBtn) ui.specialBtn.classList[method]('active');
}

function showHomeNotice(text) {
  const ui = window._ui;
  if (!ui) return;
  ui.homeNotice.textContent = text;
  setTimeout(() => { ui.homeNotice.textContent = ''; }, 4000);
}

function selectClass(classId, label) {
  selectedClass = classId;
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify({ type: 'class', classId }));
  }
  if (classText) classText.setText(`Class: ${label}`);
}

function setupTouchControls() {
  const specialBtn = document.getElementById('specialBtn');
  const fireBtn = document.getElementById('fireBtn');
  const joystick = document.getElementById('joystick');
  const joystickKnob = document.getElementById('joystickKnob');
  const touchUi = {
    setActive(active) {
      if (joystick) joystick.classList.toggle('active', active);
      if (fireBtn) fireBtn.classList.toggle('active', active);
      if (specialBtn) specialBtn.classList.toggle('active', active);
    }
  };
  window._touchUi = touchUi;
  touchUi.setActive(false);

  if (specialBtn) {
    specialBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      initAudio();
      if (socket && socket.readyState === 1) socket.send(JSON.stringify({ type: 'special' }));
      playSound('special');
    }, { passive: false });
  }

  if (fireBtn) {
    fireBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      initAudio();
      if (!socket || socket.readyState !== 1) return;
      const dir = getMoveVector();
      const aim = dir.length() === 0 ? { x: 1, y: 0 } : { x: dir.x, y: dir.y };
      socket.send(JSON.stringify({ type: 'fire', dir: aim }));
      playSound('shoot');
    }, { passive: false });
  }

  if (joystick && joystickKnob) {
    joystick.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      joystickId = t.identifier;
      touchMove.active = true;
      updateJoystick(t);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joystickId) {
          updateJoystick(t);
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joystickId) {
          joystickId = null;
          touchMove.active = false;
          touchMove.x = 0;
          touchMove.y = 0;
          joystickKnob.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    });

    function updateJoystick(touch) {
      const rect = joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;
      const max = rect.width * 0.4;
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(max, dist);
      const nx = (dx / dist) * clamped;
      const ny = (dy / dist) * clamped;
      joystickKnob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
      touchMove.x = (nx / max) || 0;
      touchMove.y = (ny / max) || 0;
    }
  }
}

function syncPlayers(serverPlayers) {
  const scene = game.scene.scenes[0];
  const seen = new Set();

  serverPlayers.forEach((p) => {
    seen.add(p.id);
    if (!players.has(p.id)) {
      const spriteKey = p.class || 'gator';
      const ringColor = p.team === 'red' ? 0xfa4616 : 0x38a3ff;
      const ring = scene.add.circle(p.x, p.y + 10, 16, ringColor, 0.22).setStrokeStyle(2, ringColor);
      const sprite = scene.add.image(p.x, p.y, spriteKey).setScale(0.5);
      sprite.setTint(p.team === 'red' ? 0xffa08a : 0x9ad2ff);
      const labelText = p.id === playerId ? (p.name || 'YOU') : (p.name || (p.isBot ? 'BOT' : 'PLAYER'));
      const label = scene.add.text(p.x, p.y - 34, labelText, {
        fontFamily: 'Inter',
        fontSize: '10px',
        color: '#ffffff'
      }).setOrigin(0.5);
      const hpBar = scene.add.rectangle(p.x, p.y + 28, 30, 4, 0x2ecc71).setOrigin(0.5);
      players.set(p.id, { sprite, label, hpBar, ring });
    }

    const obj = players.get(p.id);
    if (obj.sprite.texture.key !== p.class) {
      obj.sprite.setTexture(p.class);
    }
    obj.sprite.setPosition(p.x, p.y);
    obj.label.setPosition(p.x, p.y - 34);
    if (obj.ring) obj.ring.setPosition(p.x, p.y + 10);
    const labelText = p.id === playerId ? (p.name || 'YOU') : (p.name || (p.isBot ? 'BOT' : 'PLAYER'));
    if (obj.label.text !== labelText) obj.label.setText(labelText);
    const hpWidth = Math.max(0, (p.hp / p.maxHp) * 30);
    obj.hpBar.setSize(hpWidth, 4);
    obj.hpBar.setPosition(p.x, p.y + 28);
    const invis = p.invisUntil && Date.now() < p.invisUntil;
    const alpha = p.dead ? 0.2 : (invis ? 0.35 : 1);
    obj.sprite.setAlpha(alpha);
    obj.label.setAlpha(alpha);
    obj.hpBar.setAlpha(alpha);

    if (p.hitAt) {
      const last = lastHitFlash.get(p.id) || 0;
      if (p.hitAt > last) {
        lastHitFlash.set(p.id, p.hitAt);
        obj.sprite.setTintFill(0xffffff);
        if (p.hitX && p.hitY) spawnHitParticles(p.hitX, p.hitY, p.hitBy);
        if (p.id === playerId) {
          playSound('hit');
          if (scene && scene.cameras && scene.cameras.main) {
            scene.cameras.main.shake(80, 0.004);
          }
        }
        setTimeout(() => obj.sprite.clearTint(), 120);
      }
    }

    if (!cameraLocked && p.id === playerId) {
      scene.cameras.main.startFollow(obj.sprite, true, 0.08, 0.08);
      cameraLocked = true;
    }

    if (p.id === playerId && classText && p.class) {
      const label = p.class === 'behemoth' ? 'Bureaucrat Behemoth'
        : p.class === 'gator' ? 'Swamp Gator'
        : p.class === 'lizard' ? 'Lobbyist Lizard'
        : 'Corruption Cobra';
      classText.setText(`Class: ${label}`);
    }
  });

  for (const [id, obj] of players.entries()) {
    if (!seen.has(id)) {
      obj.sprite.destroy();
      obj.label.destroy();
      obj.hpBar.destroy();
      if (obj.ring) obj.ring.destroy();
      players.delete(id);
    }
  }
}

function syncProjectiles(serverProjectiles) {
  const scene = game.scene.scenes[0];
  const seen = new Set();

  serverProjectiles.forEach((proj) => {
    seen.add(proj.id);
    if (!projectiles.has(proj.id)) {
      const color = proj.team === 'red' ? 0xfa4616 : 0x38a3ff;
      const circle = scene.add.circle(proj.x, proj.y, 5, color, 0.8);
      projectiles.set(proj.id, { sprite: circle, lastX: proj.x, lastY: proj.y });
      spawnMuzzleFlash(proj.x, proj.y, color);
    }
    const obj = projectiles.get(proj.id);
    if (!obj) return;
    spawnTrail(obj.lastX, obj.lastY, proj.team === 'red' ? 0xfa4616 : 0x38a3ff);
    obj.sprite.setPosition(proj.x, proj.y);
    obj.lastX = proj.x;
    obj.lastY = proj.y;
  });

  for (const [id, obj] of projectiles.entries()) {
    if (!seen.has(id)) {
      obj.sprite.destroy();
      projectiles.delete(id);
    }
  }
}

function clearPlayers() {
  for (const [id, obj] of players.entries()) {
    obj.sprite.destroy();
    obj.label.destroy();
    obj.hpBar.destroy();
    players.delete(id);
  }
  cameraLocked = false;
}

function clearProjectiles() {
  for (const [id, obj] of projectiles.entries()) {
    obj.destroy();
    projectiles.delete(id);
  }
}

function updateLobbyRoster(playerList) {
  const ui = window._ui;
  if (!ui || !ui.lobbyList) return;
  ui.lobbyList.innerHTML = '';
  playerList.filter(p => !p.isBot).forEach((p) => {
    const row = document.createElement('div');
    row.className = 'lobby-row';
    const name = document.createElement('span');
    name.textContent = p.name || 'Player';
    const ready = document.createElement('span');
    if (p.disconnectedAt) {
      ready.textContent = 'Disconnected';
      ready.className = 'lobby-notready';
    } else {
      ready.textContent = p.ready ? 'Ready' : 'Not Ready';
      ready.className = p.ready ? 'lobby-ready' : 'lobby-notready';
    }
    row.appendChild(name);
    row.appendChild(ready);
    ui.lobbyList.appendChild(row);
  });
}

function drawObstacles() {
  const scene = game.scene.scenes[0];
  obstacles.forEach(o => {
    const rect = scene.add.rectangle(o.x, o.y, o.w, o.h, 0x2b6b3d, 1);
    rect.setStrokeStyle(2, 0x1f4f2f);
  });
}

function showWinner(text) {
  const el = document.getElementById('winner');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function spawnHitParticles(x, y, team) {
  const scene = game.scene.scenes[0];
  const color = team === 'red' ? 0xfa4616 : 0x38a3ff;
  for (let i = 0; i < 8; i++) {
    const circle = scene.add.circle(x, y, 3, color, 0.9);
    hitParticles.push({
      sprite: circle,
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.7) * 3,
      life: 300
    });
  }
}

function spawnTrail(x, y, color) {
  const scene = game.scene.scenes[0];
  const dot = scene.add.circle(x, y, 2, color, 0.35);
  setTimeout(() => dot.destroy(), 180);
}

function spawnMuzzleFlash(x, y, color) {
  const scene = game.scene.scenes[0];
  const flash = scene.add.circle(x, y, 6, color, 0.9);
  muzzleFlashes.push(flash);
  setTimeout(() => {
    flash.destroy();
  }, 80);
}

function getMoveVector() {
  const left = cursors.left.isDown || wasd.A.isDown;
  const right = cursors.right.isDown || wasd.D.isDown;
  const up = cursors.up.isDown || wasd.W.isDown;
  const down = cursors.down.isDown || wasd.S.isDown;

  let v = new Phaser.Math.Vector2(
    (left ? -1 : 0) + (right ? 1 : 0),
    (up ? -1 : 0) + (down ? 1 : 0)
  );

  if (touchMove.active) {
    v = new Phaser.Math.Vector2(touchMove.x, touchMove.y);
  }

  if (v.length() > 0) v.normalize();
  return v;
}

function updateStatus(text, cls) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.remove('online', 'offline');
  if (cls) statusEl.classList.add(cls);
}

function logEvent(type, data = {}) {
  try {
    const payload = {
      type,
      data,
      room: roomCode,
      mode,
      ts: Date.now(),
      ua: navigator.userAgent
    };
    navigator.sendBeacon(LOG_ENDPOINT, JSON.stringify(payload));
  } catch {}
}

window.addEventListener('error', (e) => {
  logEvent('client_error', { message: e.message, source: e.filename, line: e.lineno, col: e.colno });
});
window.addEventListener('unhandledrejection', (e) => {
  logEvent('promise_rejection', { reason: `${e.reason || ''}` });
});

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (!ambientOsc) {
    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
    ambientGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    ambientOsc.connect(ambientGain).connect(audioCtx.destination);
    ambientOsc.start();
  }
}

function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  if (type === 'shoot') {
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  } else if (type === 'dash') {
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  } else if (type === 'special') {
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  } else if (type === 'hit') {
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  }

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

function stopAmbient() {
  if (ambientOsc) {
    ambientOsc.stop();
    ambientOsc.disconnect();
    ambientGain.disconnect();
    ambientOsc = null;
    ambientGain = null;
  }
}
