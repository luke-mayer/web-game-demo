class Example extends Phaser.Scene {
  player;
  cursors;

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
    const rt = this.make.renderTexture({
      width: this.game.config.width,
      height: this.game.config.height,
      add: false,
    });

    const maskImage = this.make.image({
      x: 0,
      y: 0,
      key: rt.texture.key,
      add: false,
    });

    // Fog of war
    const cover = this.add.graphics();
    cover.fillStyle(0x000000, 1);
    cover.fillRect(0, 0, this.game.config.width, this.game.config.height);
    cover.generateTexture(
      "fog",
      this.game.config.width,
      this.game.config.height,
    );

    const fogImage = this.add.image(0, 0, "fog").setOrigin(0);
    fogImage.mask = new Phaser.Display.Masks.BitmapMask(this, maskImage);
    fogImage.mask.invertAlpha = true;

    map.mask = new Phaser.Display.Masks.BitmapMask(this, maskImage);

    this.renderTexture = rt;
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

    const coneLength = 200;
    const coneAngle = Phaser.Math.DegToRad(30);
    const playerAngle = this.player.rotation;

    const startX = this.player.x;
    const startY = this.player.y;
    const endX1 = startX + Math.cos(playerAngle - coneAngle) * coneLength;
    const endY1 = startY + Math.sin(playerAngle - coneAngle) * coneLength;
    const endX2 = startX + Math.cos(playerAngle + coneAngle) * coneLength;
    const endY2 = startY + Math.sin(playerAngle + coneAngle) * coneLength;

    const coneGraphics = this.add.graphics();
    coneGraphics.clear();
    coneGraphics.fillStyle(0xffffff, 1);
    coneGraphics.beginPath();
    coneGraphics.moveTo(startX, startY);
    coneGraphics.lineTo(endX1, endY1);
    coneGraphics.lineTo(endX2, endY2);
    coneGraphics.closePath();
    coneGraphics.fillPath();
    coneGraphics.visible = false;

    this.renderTexture.clear();
    this.renderTexture.draw(coneGraphics, 400, 300);
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
