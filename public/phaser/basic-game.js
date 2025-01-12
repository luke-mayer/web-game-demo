class Example extends Phaser.Scene {
  player;
  cursors;

  constructor() {
    super("wg-demo");

    this.player = null;
    this.flashlight = null;
    this.renderTexture = null;
  }

  preload() {
    this.load.image("sky", "https://labs.phaser.io/assets/skies/space3.png");
    this.load.image(
      "logo",
      "https://labs.phaser.io/assets/sprites/phaser3-logo.png",
    );
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");

    this.load.spritesheet(
      "handgunSprite",
      "./phaser/assets/SpritesheetGuns.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );

    this.load.spritesheet("reticle", "./phaser/assets/IconsAndParticles.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    const x = 400;
    const y = 300;

    // Background
    this.add.image(x, y, "sky");

    this.reticle = this.add.image(x, y, "reticle", 10);

    this.player = this.physics.add.sprite(x, y, "handgunSprite");
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "key",
      frames: [{ key: "handgunSprite", frame: 0 }],
      frameRate: 10,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // Set camera properties
    this.cameras.main.zoom = 1.0;
    this.cameras.main.startFollow(this.player);

    // render texture for fog of war
    const rt = this.make.renderTexture({
      width: this.game.config.width,
      height: this.game.config.height,
      add: false,
    });

    // Fog of war
    this.fow = this.add.graphics();
    this.fow.fillStyle(0x000000, 1);
    this.fow.fillRect(0, 0, this.game.config.width, this.game.config.height);

    // Flashlight
    this.flashlight = this.add.graphics();
    const fowMask = this.flashlight.createGeometryMask();
    this.fow.setMask(fowMask);

    fowMask.invertAlpha = true;
  }

  update() {
    // Movement with arrow keys
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("key", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("key", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("key");
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play("key", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play("key", true);
    } else {
      this.player.setVelocityY(0);
    }

    // Reticle follows mouse
    this.input.on("pointermove", (pointer) => {
      this.reticle.x = pointer.x;
      this.reticle.y = pointer.y;
    });

    this.player.rotation = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.reticle.x,
      this.reticle.y,
    );

    this.flashlight.clear();

    const coneLength = 200;
    const coneAngle = Phaser.Math.DegToRad(30);
    const playerAngle = this.player.rotation;

    const startX = this.player.x;
    const startY = this.player.y;
    const endX1 = startX + Math.cos(playerAngle - coneAngle) * coneLength;
    const endY1 = startY + Math.sin(playerAngle - coneAngle) * coneLength;
    const endX2 = startX + Math.cos(playerAngle + coneAngle) * coneLength;
    const endY2 = startY + Math.sin(playerAngle + coneAngle) * coneLength;

    this.flashlight.fillStyle(0xffffff, 1);
    this.flashlight.beginPath();
    this.flashlight.moveTo(startX, startY);
    this.flashlight.lineTo(endX1, endY1);
    this.flashlight.lineTo(endX2, endY2);
    this.flashlight.closePath();
    this.flashlight.fillPath();
    this.light.visible = false;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  //parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: Example,
};

new Phaser.Game(config);
