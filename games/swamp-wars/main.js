const SERVER_BASE = 'wss://influence-arena-server.m2clawdbot.workers.dev';

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
let scores = { red: 0, blue: 0 };
let scoreText;
let timerText;
let classText;
let zone;
let zoneText;
let dashReady = true;
let statusEl;
let cameraLocked = false;
let touchMove = { active: false, x: 0, y: 0 };
let selectedClass = 'gator';
let obstacles = [];
let lastInputSent = 0;
let audioCtx;
let roomCode = 'global';
let isHost = false;
let mode = 'online';
let searchTimer;

function preload() {
  this.load.image('behemoth', 'assets/behemoth.svg');
  this.load.image('gator', 'assets/gator.svg');
  this.load.image('lizard', 'assets/lizard.svg');
  this.load.image('cobra', 'assets/cobra.svg');
}

function create() {
  this.physics.world.setBounds(0, 0, 1600, 900);
  this.cameras.main.setBounds(0, 0, 1600, 900);
  this.cameras.main.setZoom(1.2);
  this.cameras.main.setLerp(0.08, 0.08);

  // Grass field
  this.add.rectangle(800, 450, 1500, 820, 0x0b5f2a).setStrokeStyle(2, 0x0f8b3f);
  const grass = this.add.graphics();
  grass.fillStyle(0x0f8b3f, 0.5);
  for (let x = 60; x < 1540; x += 60) {
    for (let y = 60; y < 840; y += 60) {
      grass.fillCircle(x + (y % 120), y, 6);
    }
  }

  zone = this.add.circle(800, 450, 110, 0x1f5b8f, 0.35).setStrokeStyle(2, 0x38a3ff);
  zoneText = this.add.text(800, 450, 'INFLUENCE', {
    fontFamily: 'Oswald',
    fontSize: '20px',
    color: '#f0a830'
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
  });
}

function update() {
  if (!socket || socket.readyState !== 1) return;
  const now = performance.now();
  if (now - lastInputSent < 50) return; // 20Hz
  lastInputSent = now;
  const move = getMoveVector();
  socket.send(JSON.stringify({ type: 'input', input: { x: move.x, y: move.y } }));
}

function connectSocket() {
  const url = `${SERVER_BASE}?room=${encodeURIComponent(roomCode)}&mode=${mode}${isHost ? '&host=1' : ''}`;
  socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    updateStatus(mode === 'offline' ? 'Offline' : 'Online', 'online');
    if (mode === 'offline') {
      socket.send(JSON.stringify({ type: 'start' }));
    }
  });

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'welcome') {
      playerId = payload.id;
      if (payload.obstacles) {
        obstacles = payload.obstacles;
        drawObstacles();
      }
      if (payload.hostId) {
        isHost = payload.hostId === playerId;
      }
    }
    if (payload.type === 'state') {
      syncPlayers(payload.players);
      syncProjectiles(payload.projectiles || []);
      scores = payload.scores;
      scoreText.setText(`Red ${Math.floor(scores.red)} — ${Math.floor(scores.blue)} Blue`);
      if (timerText) {
        const seconds = Math.max(0, Math.floor(payload.matchTime || 0));
        const m = Math.floor(seconds / 60);
        const s = `${seconds % 60}`.padStart(2, '0');
        timerText.setText(`Time ${m}:${s}`);
      }
      const humansCount = payload.humans ?? payload.players.filter(p => !p.isBot).length;
      updateStatus(`${mode === 'offline' ? 'Offline' : 'Online'} • ${payload.players.length} players`, 'online');
      updateLobbyUi(payload.players.length, payload.started, payload.hostId, humansCount, payload.full);
      if (payload.matchOver) {
        const winner = scores.red === scores.blue ? 'DRAW' : (scores.red > scores.blue ? 'RED WINS' : 'BLUE WINS');
        showWinner(winner);
      }
      if (mode === 'online' && !payload.started && window._searching) {
        window._searchingCount = humansCount;
        const ui = window._ui;
        if (ui && ui.searchCount) ui.searchCount.textContent = `Humans: ${window._searchingCount} / 4`;
      }
    }
    if (payload.type === 'full') {
      showHomeNotice('Game Full');
      returnToHome();
      return;
    }
  });

  socket.addEventListener('close', () => {
    updateStatus('Offline', 'offline');
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
  const roomLabel = document.getElementById('roomLabel');
  const playersCount = document.getElementById('playersCount');
  const humansCount = document.getElementById('humansCount');

  const cards = characterScreen.querySelectorAll('.card');
  const done = document.getElementById('characterDone');

  window._ui = { home, characterScreen, customScreen, matchLobby, searching, searchCount, gameEl, hud, homeNotice, roomLabel, playersCount, humansCount, startMatch };

  playOnline.addEventListener('click', () => {
    mode = 'online';
    roomCode = 'global';
    isHost = false;
    startSearch();
  });

  offlinePlay.addEventListener('click', () => {
    mode = 'offline';
    roomCode = `offline-${Math.random().toString(36).slice(2, 8)}`;
    isHost = true;
    startLobby();
  });

  customLobby.addEventListener('click', () => {
    home.classList.add('hidden');
    customScreen.classList.remove('hidden');
  });

  swapCharacter.addEventListener('click', () => {
    home.classList.add('hidden');
    characterScreen.classList.remove('hidden');
  });

  createRoom.addEventListener('click', () => {
    mode = 'custom';
    roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    isHost = true;
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
  });

  startMatch.addEventListener('click', () => {
    if (!socket || socket.readyState !== 1) return;
    socket.send(JSON.stringify({ type: 'start' }));
    matchLobby.classList.add('hidden');
  });

  function startSearch() {
    home.classList.add('hidden');
    searching.classList.remove('hidden');
    gameEl.classList.remove('hidden');
    hud.classList.add('active');
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

  if (mode === 'custom' && ui.startMatch) {
    if (playerId && hostId === playerId) {
      ui.startMatch.disabled = false;
      ui.startMatch.textContent = 'Start Match';
    } else {
      ui.startMatch.disabled = true;
      ui.startMatch.textContent = 'Waiting for host…';
    }
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
  if (specialBtn) {
    specialBtn.addEventListener('click', () => {
      initAudio();
      if (socket && socket.readyState === 1) socket.send(JSON.stringify({ type: 'special' }));
      playSound('special');
    });
  }

  window.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    initAudio();
    const touch = e.touches[0];
    const w = window.innerWidth;
    if (touch.clientX < w * 0.5) {
      touchMove.active = true;
      touchMove.x = (touch.clientX - w * 0.25) / (w * 0.25);
      touchMove.y = (touch.clientY - window.innerHeight * 0.5) / (window.innerHeight * 0.25);
    } else if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: 'fire', dir: { x: 1, y: 0 } }));
      playSound('shoot');
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (!touchMove.active || !e.touches[0]) return;
    const touch = e.touches[0];
    const w = window.innerWidth;
    if (touch.clientX < w * 0.5) {
      touchMove.x = (touch.clientX - w * 0.25) / (w * 0.25);
      touchMove.y = (touch.clientY - window.innerHeight * 0.5) / (window.innerHeight * 0.25);
    }
  });

  window.addEventListener('touchend', () => {
    touchMove.active = false;
    touchMove.x = 0;
    touchMove.y = 0;
  });
}

function syncPlayers(serverPlayers) {
  const scene = game.scene.scenes[0];
  const seen = new Set();

  serverPlayers.forEach((p) => {
    seen.add(p.id);
    if (!players.has(p.id)) {
      const spriteKey = p.class || 'gator';
      const sprite = scene.add.image(p.x, p.y, spriteKey).setScale(0.5);
      const label = scene.add.text(p.x, p.y - 34, p.id === playerId ? 'YOU' : (p.isBot ? 'BOT' : 'PLAYER'), {
        fontFamily: 'Inter',
        fontSize: '10px',
        color: '#ffffff'
      }).setOrigin(0.5);
      const hpBar = scene.add.rectangle(p.x, p.y + 28, 30, 4, 0x2ecc71).setOrigin(0.5);
      players.set(p.id, { sprite, label, hpBar });
    }

    const obj = players.get(p.id);
    if (obj.sprite.texture.key !== p.class) {
      obj.sprite.setTexture(p.class);
    }
    obj.sprite.setPosition(p.x, p.y);
    obj.label.setPosition(p.x, p.y - 34);
    const hpWidth = Math.max(0, (p.hp / p.maxHp) * 30);
    obj.hpBar.setSize(hpWidth, 4);
    obj.hpBar.setPosition(p.x, p.y + 28);
    const invis = p.invisUntil && Date.now() < p.invisUntil;
    const alpha = p.dead ? 0.2 : (invis ? 0.35 : 1);
    obj.sprite.setAlpha(alpha);
    obj.label.setAlpha(alpha);
    obj.hpBar.setAlpha(alpha);

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
      projectiles.set(proj.id, circle);
    }
    const obj = projectiles.get(proj.id);
    obj.setPosition(proj.x, proj.y);
  });

  for (const [id, obj] of projectiles.entries()) {
    if (!seen.has(id)) {
      obj.destroy();
      projectiles.delete(id);
    }
  }
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

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  if (type === 'shoot') {
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  } else if (type === 'dash') {
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  } else if (type === 'special') {
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  }

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}
