
function crearCancha(scene, w, h) {
  scene.add.rectangle(w / 2, h / 2, w, h, 0x1b5e20);

  const lineColor = 0xffffff;
  const thickness = 4;

  scene.add.rectangle(w / 2, thickness / 2, w, thickness, lineColor);
  scene.add.rectangle(w / 2, h - thickness / 2, w, thickness, lineColor);
  scene.add.rectangle(thickness / 2, h / 2, thickness, h, lineColor);
  scene.add.rectangle(w - thickness / 2, h / 2, thickness, h, lineColor);

  scene.add.rectangle(w / 2, h / 2, w, thickness, lineColor);
  scene.add.rectangle(w / 2, h * 0.375, thickness, h * 0.25, lineColor);
  scene.add.rectangle(w / 2, h * 0.625, thickness, h * 0.25, lineColor);

  const sideInset = w * 0.08;
  scene.add.rectangle(sideInset, h / 2, thickness, h, lineColor);
  scene.add.rectangle(w - sideInset, h / 2, thickness, h, lineColor);

  const singlesWidth = w - 2 * sideInset;
  scene.add.rectangle(w / 2, h * 0.25, singlesWidth, thickness, lineColor);
  scene.add.rectangle(w / 2, h * 0.75, singlesWidth, thickness, lineColor);
}

function crearJugador(scene, x, y, width, height) {
  const player = scene.add.rectangle(x, y, width, height, 0xffffff);
  scene.physics.add.existing(player);
  player.body.setImmovable(true);
  player.body.setCollideWorldBounds(true);
  return player;
}

function crearPelota(scene, x, y, radius) {
  const pelota = scene.add.circle(x, y, radius, 0xffffff);
  scene.physics.add.existing(pelota);
  pelota.body.setCircle(radius);
  pelota.body.setCollideWorldBounds(true);
  pelota.body.setBounce(1);
  return pelota;
}


const gameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  backgroundColor: "#2e7d32",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: TennisScene
};

const game = new Phaser.Game(gameConfig);
