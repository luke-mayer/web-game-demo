import PhaserRaycaster from "phaser-raycaster";

class Example extends Phaser.Scene {
  player;
  cursors;
  raycaster;
  ray;
  intersections;
  obstacles;
  graphics;

  constructor() {
    super("wg-demo");

    this.player = null;
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
    const map = this.add.image(x, y, "sky");

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
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "black",
  //parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  plugins: {
    scene: [
      {
        key: "PhaserRaycaster",
        plugin: PhaserRaycaster,
        mapping: "raycasterPlugin",
      },
    ],
  },
  scene: Example,
};

new Phaser.Game(config);
