class TennisScene extends Phaser.Scene {
  constructor() {
    super("TennisScene");
    this.ballInPlay = false;
    this.maxBallSpeed = 600;
    this.lastHitter = 0;
    this.ballSpin = 0;
  }

  preload() {}

  create() {
    const canvasW = this.sys.game.config.width;
    const canvasH = this.sys.game.config.height;

    this.canvasWidth = canvasW;
    this.canvasHeight = canvasH;

    const w = 600;
    const h = 800;

    this.courtWidth = w;
    this.courtHeight = h;
    this.offsetX = (canvasW - w) / 2;
    this.offsetY = (canvasH - h) / 2;

    this.physics.world.setBounds(this.offsetX, this.offsetY, w, h);

    // Increase the physics simulation rate to improve collision accuracy
    this.physics.world.setFPS(120);

    crearCancha(this, w, h, this.offsetX, this.offsetY);

    const paddleWidth = w * 0.15;
    const paddleHeight = h * 0.02;

    this.player1 = crearJugador(
      this,
      this.offsetX + w / 2,
      this.offsetY + h - paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
    this.player1.body.setCollideWorldBounds(false);
    this.player2 = crearJugador(
      this,
      this.offsetX + w / 2,
      this.offsetY + paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
    this.player2.body.setCollideWorldBounds(false);

    const radius = h * 0.01;
    this.ball = crearPelota(this, this.player1.x, this.player1.y - 20, radius);
    this.ball.body.setMaxVelocity(this.maxBallSpeed, this.maxBallSpeed);
    this.ball.body.enable = false;
    this.ball.body.onWorldBounds = true;

    this.physics.world.on("worldbounds", this.onWorldBounds, this);

    this.physics.add.collider(this.ball, this.player1, this.onPlayerHit, null, this);
    this.physics.add.collider(this.ball, this.player2, this.onPlayerHit, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.scoreboard = new Scoreboard(this, w, h, this.offsetX, this.offsetY);
  }

  update() {
    const w = this.courtWidth;
    const h = this.courtHeight;
    const offsetX = this.offsetX;
    const offsetY = this.offsetY;
    const canvasW = this.canvasWidth;
    const canvasH = this.canvasHeight;
    const midY = canvasH / 2;

    // Keep players within the canvas and their respective halves
    this.player1.x = Phaser.Math.Clamp(
      this.player1.x,
      this.player1.width / 2,
      canvasW - this.player1.width / 2
    );
    this.player1.y = Phaser.Math.Clamp(
      this.player1.y,
      midY + this.player1.height / 2,
      canvasH - this.player1.height / 2
    );
    this.player2.x = Phaser.Math.Clamp(
      this.player2.x,
      this.player2.width / 2,
      canvasW - this.player2.width / 2
    );
    this.player2.y = Phaser.Math.Clamp(
      this.player2.y,
      this.player2.height / 2,
      midY - this.player2.height / 2
    );

    const speed = 400;
    this.player1.body.setVelocity(0);

    if (this.ballInPlay) {
      if (this.cursors.left.isDown) {
        this.player1.body.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player1.body.setVelocityX(speed);
      }

      if (
        this.cursors.up.isDown &&
        this.player1.y > midY + 20
      ) {
        this.player1.body.setVelocityY(-speed);
      } else if (
        this.cursors.down.isDown &&
        this.player1.y < canvasH - 20
      ) {
        this.player1.body.setVelocityY(speed);
      }
    } else {
      this.player1.setPosition(offsetX + w / 2, offsetY + h - this.player1.height / 2);
    }

    if (!this.ballInPlay) {
      this.ball.setPosition(this.player1.x, this.player1.y - 20);
    }

    if (this.ballInPlay && this.ball.body.velocity.y < 0) {
      const targetX = Phaser.Math.Clamp(
        this.ball.x,
        this.player2.width / 2,
        canvasW - this.player2.width / 2
      );
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
      this.ball.body.enable = true;
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

      if (this.ballSpin !== 0) {
        this.ball.body.setVelocityX(this.ball.body.velocity.x + this.ballSpin);
        this.ballSpin *= 0.98;
        if (Math.abs(this.ballSpin) < 0.1) {
          this.ballSpin = 0;
        }
      }
    }

  }

  onPlayerHit(ball, player) {
    const ballBody = ball.body;
    const playerBody = player.body;
    const relativeX = ball.x - player.x;
    const dir = player === this.player1 ? -1 : 1;

    this.lastHitter = player === this.player1 ? 0 : 1;

    const vx =
      ballBody.velocity.x +
      relativeX * 5 +
      playerBody.velocity.x * 0.8;
    const vy = dir * Math.abs(ballBody.velocity.y + playerBody.velocity.y * 0.8);

    this.ballSpin = playerBody.velocity.x * 0.02;

    ballBody.setVelocity(vx, vy);

    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > this.maxBallSpeed) {
      const scale = this.maxBallSpeed / speed;
      ballBody.setVelocity(vx * scale, vy * scale);
    }
  }

  onWorldBounds(body, up, down) {
    if (body.gameObject !== this.ball || !this.ballInPlay) {
      return;
    }

    if (up || down) {
      this.scoreboard.pointFor(this.lastHitter);
      this.resetBall();
    }
  }

  resetBall() {
    this.ballInPlay = false;
    this.ball.body.setVelocity(0);
    this.ball.body.enable = false;
    this.ballSpin = 0;
    this.player1.setPosition(
      this.offsetX + this.courtWidth / 2,
      this.offsetY + this.courtHeight - this.player1.height / 2
    );
    this.ball.setPosition(this.player1.x, this.player1.y - 20);
  }
}
