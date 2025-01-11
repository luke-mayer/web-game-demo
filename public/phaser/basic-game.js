class Example extends Phaser.Scene {
  constructor() {
    super("MyFirstScene");
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
  }

  create() {
    this.add.image(400, 300, "sky");

    this.player = this.add.sprite(400, 300, "handgunSprite");

    this.anims.create({
      key: "key",
      frames: [{ key: "handgunSprite", frame: 0 }],
      frameRate: 10,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

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
    } else if (this.cursors.up.isUp) {
      this.player.setVelocityY(160);
      this.player.anims.play("key", true);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaser-example",
  scene: Example,
};

new Phaser.Game(config);
