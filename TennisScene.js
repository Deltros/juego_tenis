class TennisScene extends Phaser.Scene {
  constructor() {
    super("TennisScene");
    this.ballInPlay = false;
    this.maxBallSpeed = 600;
  }

  preload() {}

  create() {
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    // Increase the physics simulation rate to improve collision accuracy
    this.physics.world.setFPS(120);

    crearCancha(this, w, h);

    const paddleWidth = w * 0.15;
    const paddleHeight = h * 0.02;

    this.player1 = crearJugador(this, w / 2, h * 0.95, paddleWidth, paddleHeight);
    this.player2 = crearJugador(this, w / 2, h * 0.05, paddleWidth, paddleHeight);

    const radius = h * 0.01;
    this.ball = crearPelota(this, this.player1.x, this.player1.y - 20, radius);
    this.ball.body.setMaxVelocity(this.maxBallSpeed, this.maxBallSpeed);

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

    if (this.ballInPlay && this.ball.body.velocity.y < 0) {
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

    if (!this.ballInPlay && Phaser.Input.Keyboard.JustDown(this.startKey)) {
      this.ballInPlay = true;
      this.ball.body.setVelocity(Phaser.Math.Between(-200, 200), -400);
    }

    if (this.ballInPlay) {
      const vx = this.ball.body.velocity.x;
      const vy = this.ball.body.velocity.y;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > this.maxBallSpeed) {
        const scale = this.maxBallSpeed / speed;
        this.ball.body.setVelocity(vx * scale, vy * scale);
      }
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
    this.ballInPlay = false;
    this.ball.body.setVelocity(0);
    this.ball.setPosition(this.player1.x, this.player1.y - 20);
  }
}
