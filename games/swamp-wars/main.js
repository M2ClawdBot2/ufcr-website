const SERVER_URL = 'wss://influence-arena-server.m2clawdbot.workers.dev?room=ufcr';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#0A0E1A',
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
    mode: Phaser.Scale.FIT,
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
let zone;
let zoneText;
let dashReady = true;
let statusEl;
let cameraLocked = false;

function preload() {}

function create() {
  // Arena bounds
  this.physics.world.setBounds(0, 0, 960, 540);
  this.cameras.main.setBounds(0, 0, 960, 540);
  this.add.rectangle(480, 270, 880, 460, 0x0f1526).setStrokeStyle(2, 0x1f2b45);

  // Influence zone
  zone = this.add.circle(480, 270, 80, 0x1f5b8f, 0.35).setStrokeStyle(2, 0x38a3ff);
  zoneText = this.add.text(480, 270, 'INFLUENCE', {
    fontFamily: 'Oswald',
    fontSize: '18px',
    color: '#f0a830'
  }).setOrigin(0.5);

  scoreText = this.add.text(24, 24, 'Red 0 — 0 Blue', {
    fontFamily: 'Inter',
    fontSize: '16px',
    color: '#ffffff'
  });
  timerText = this.add.text(24, 48, 'Time 3:00', {
    fontFamily: 'Inter',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)'
  });

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,S,D');

  this.input.keyboard.on('keydown-SPACE', () => {
    if (!dashReady || !socket || socket.readyState !== 1) return;
    dashReady = false;
    const dir = getMoveVector();
    if (dir.length() === 0) return;
    socket.send(JSON.stringify({ type: 'dash' }));
    this.time.delayedCall(800, () => {
      dashReady = true;
    });
  });

  this.input.on('pointerdown', (pointer) => {
    if (!socket || socket.readyState !== 1) return;
    const scene = game.scene.scenes[0];
    const worldPoint = pointer.positionToCamera(scene.cameras.main);
    const me = players.get(playerId);
    if (!me) return;
    const dir = { x: worldPoint.x - me.circle.x, y: worldPoint.y - me.circle.y };
    socket.send(JSON.stringify({ type: 'fire', dir }));
  });

  statusEl = document.getElementById('status');
  connectSocket();
}

function update() {
  if (!socket || socket.readyState !== 1) return;
  const move = getMoveVector();
  socket.send(JSON.stringify({ type: 'input', input: { x: move.x, y: move.y } }));
}

function connectSocket() {
  socket = new WebSocket(SERVER_URL);

  socket.addEventListener('open', () => {
    updateStatus('Online', 'online');
  });

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'welcome') {
      playerId = payload.id;
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
      updateStatus(`Online • ${payload.players.length} players`, 'online');
      if (payload.matchOver) {
        const winner = scores.red === scores.blue ? 'DRAW' : (scores.red > scores.blue ? 'RED WINS' : 'BLUE WINS');
        showBanner(winner);
      }
    }
  });

  socket.addEventListener('close', () => {
    updateStatus('Offline', 'offline');
  });
}

function updateStatus(text, cls) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.remove('online', 'offline');
  if (cls) statusEl.classList.add(cls);
}

function syncPlayers(serverPlayers) {
  const scene = game.scene.scenes[0];
  const seen = new Set();

  serverPlayers.forEach((p) => {
    seen.add(p.id);
    if (!players.has(p.id)) {
      const color = p.team === 'red' ? 0xfa4616 : 0x38a3ff;
      const circle = scene.add.circle(p.x, p.y, 16, color, 0.95);
      const label = scene.add.text(p.x, p.y - 26, p.id === playerId ? 'YOU' : 'PLAYER', {
        fontFamily: 'Inter',
        fontSize: '10px',
        color: '#ffffff'
      }).setOrigin(0.5);
      const hpBar = scene.add.rectangle(p.x, p.y + 22, 30, 4, 0x2ecc71).setOrigin(0.5);
      players.set(p.id, { circle, label, hpBar });
    }

    const obj = players.get(p.id);
    obj.circle.setPosition(p.x, p.y);
    obj.label.setPosition(p.x, p.y - 26);
    const hpWidth = Math.max(0, (p.hp / 100) * 30);
    obj.hpBar.setSize(hpWidth, 4);
    obj.hpBar.setPosition(p.x, p.y + 22);
    obj.circle.setAlpha(p.dead ? 0.25 : 1);
    obj.label.setAlpha(p.dead ? 0.25 : 1);
    obj.hpBar.setAlpha(p.dead ? 0.25 : 1);

    if (!cameraLocked && p.id === playerId) {
      scene.cameras.main.startFollow(obj.circle, true, 0.08, 0.08);
      cameraLocked = true;
    }
  });

  for (const [id, obj] of players.entries()) {
    if (!seen.has(id)) {
      obj.circle.destroy();
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

function showBanner(text) {
  const scene = game.scene.scenes[0];
  const banner = scene.add.rectangle(480, 100, 300, 60, 0x000000, 0.6).setStrokeStyle(2, 0xf0a830);
  const label = scene.add.text(480, 100, text, {
    fontFamily: 'Oswald',
    fontSize: '24px',
    color: '#f0a830'
  }).setOrigin(0.5);
  scene.time.delayedCall(3000, () => {
    banner.destroy();
    label.destroy();
  });
}

function getMoveVector() {
  const left = cursors.left.isDown || wasd.A.isDown;
  const right = cursors.right.isDown || wasd.D.isDown;
  const up = cursors.up.isDown || wasd.W.isDown;
  const down = cursors.down.isDown || wasd.S.isDown;

  const v = new Phaser.Math.Vector2(
    (left ? -1 : 0) + (right ? 1 : 0),
    (up ? -1 : 0) + (down ? 1 : 0)
  );
  if (v.length() > 0) v.normalize();
  return v;
}
