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
let player;
let zone;
let zoneText;
let dashReady = true;

function preload() {}

function create() {
  // Arena bounds
  const bounds = this.add.rectangle(480, 270, 880, 460, 0x0f1526).setStrokeStyle(2, 0x1f2b45);

  // Influence zone
  zone = this.add.circle(480, 270, 80, 0x1f5b8f, 0.35).setStrokeStyle(2, 0x38a3ff);
  zoneText = this.add.text(480, 270, 'INFLUENCE', {
    fontFamily: 'Oswald',
    fontSize: '18px',
    color: '#f0a830'
  }).setOrigin(0.5);

  // Player placeholder
  player = this.physics.add.circle(320, 270, 18, 0xfa4616, 0.9);
  player.body.setCollideWorldBounds(true);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,S,D');

  this.input.keyboard.on('keydown-SPACE', () => {
    if (!dashReady) return;
    dashReady = false;
    const dir = getMoveVector();
    if (dir.length() === 0) return;
    player.body.velocity.scale(3);
    this.time.delayedCall(150, () => {
      dashReady = true;
    });
  });

  this.add.text(24, 24, 'Prototype Arena', {
    fontFamily: 'Inter',
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update() {
  const speed = 170;
  const move = getMoveVector();
  player.body.setVelocity(move.x * speed, move.y * speed);
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
