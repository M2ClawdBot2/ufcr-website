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
let scores = { red: 0, blue: 0 };
let scoreText;
let zone;
let zoneText;
let dashReady = true;
let statusEl;

function preload() {}

function create() {
  // Arena bounds
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
      scores = payload.scores;
      scoreText.setText(`Red ${Math.floor(scores.red)} — ${Math.floor(scores.blue)} Blue`);
      updateStatus(`Online • ${payload.players.length} players`, 'online');
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
      players.set(p.id, { circle, label });
    }

    const obj = players.get(p.id);
    obj.circle.setPosition(p.x, p.y);
    obj.label.setPosition(p.x, p.y - 26);
  });

  for (const [id, obj] of players.entries()) {
    if (!seen.has(id)) {
      obj.circle.destroy();
      obj.label.destroy();
      players.delete(id);
    }
  }
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
