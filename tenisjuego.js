class Scoreboard {
  constructor(scene, w, h) {
    this.scene = scene;
    this.scores = [0, 0];
    this.text = scene.add
      .text(w / 2, h * 0.52, "", { fontSize: "32px", fill: "#fff" })
      .setOrigin(0.5);
    this.update();
  }

  pointFor(winnerIndex) {
    this.scores[winnerIndex]++;

    if (this.scores[winnerIndex] > 3) {
      this.scores = [0, 0];
      alert(
        "¡Punto para " +
          (winnerIndex === 0 ? "Jugador 1!" : "el Bot!") +
          "\nPresiona espacio para continuar"
      );
    }

    this.update();
  }

  update() {
    const text = `Jugador 1: ${tennisScore[this.scores[0] || 0]}   |   Bot: ${tennisScore[this.scores[1] || 0]}`;
    this.text.setText(text);
  }
}

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

class TennisScene extends Phaser.Scene {
  constructor() {
    super("TennisScene");
  }

  preload() {}

  create() {
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    crearCancha(this, w, h);

    const paddleWidth = w * 0.15;
    const paddleHeight = h * 0.02;

    this.player1 = crearJugador(this, w / 2, h * 0.95, paddleWidth, paddleHeight);
    this.player2 = crearJugador(this, w / 2, h * 0.05, paddleWidth, paddleHeight);

    const radius = h * 0.01;
    this.ball = crearPelota(this, this.player1.x, this.player1.y - 20, radius);

    this.physics.add.collider(this.ball, this.player1);
    this.physics.add.collider(this.ball, this.player2);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.scoreboard = new Scoreboard(this, w, h);
  }

  update() {
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    const speed = 400;
    this.player1.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player1.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player1.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown && this.player1.y > h / 2 + 20) {
      this.player1.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown && this.player1.y < h - 20) {
      this.player1.body.setVelocityY(speed);
    }

    if (ballInPlay && this.ball.body.velocity.y < 0) {
      const targetX = Phaser.Math.Clamp(this.ball.x, this.player2.width / 2, w - this.player2.width / 2);
      const delta = targetX - this.player2.x;
      if (Math.abs(delta) > 10) {
        this.player2.body.setVelocityX(Phaser.Math.Clamp(delta * 4, -300, 300));
      } else {
        this.player2.body.setVelocityX(0);
      }
    } else {
      this.player2.body.setVelocityX(0);
    }

    if (!ballInPlay && Phaser.Input.Keyboard.JustDown(this.startKey)) {
      ballInPlay = true;
      this.ball.body.setVelocity(Phaser.Math.Between(-200, 200), -400);
    }

    if (this.ball.y < 0) {
      this.scoreboard.pointFor(0);
      this.resetBall();
    } else if (this.ball.y > h) {
      this.scoreboard.pointFor(1);
      this.resetBall();
    }
  }

  resetBall() {
    ballInPlay = false;
    this.ball.body.setVelocity(0);
    this.ball.setPosition(this.player1.x, this.player1.y - 20);
  }
}

const tennisScore = ["0", "15", "30", "40"];
let ballInPlay = false;

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
