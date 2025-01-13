var obstacles;
var raycaster;
var ray;
var intersections;
var graphics;

class Example extends Phaser.Scene {
  player;
  cursors;

  constructor() {
    super("wg-demo");

    this.player = null;
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

    // Locks pointer to game (and makes curser hide)
    this.input.on("pointerdown", () => {
      this.input.mouse.requestPointerLock();
    });

    // Exit pointer lock when Q or escape (by default) is pressed.
    this.input.keyboard.on(
      "keydown-Q",
      () => {
        if (this.input.mouse.locked) {
          this.input.mouse.releasePointerLock();
        }
      },
      this,
    );

    // Move reticle upon locked pointer move
    this.input.on("pointermove", (pointer) => {
      if (this.input.mouse.locked) {
        this.reticle.x += pointer.movementX;
        this.reticle.y += pointer.movementY;
      }
    });

    raycaster = this.raycasterPlugin.createRaycaster();

    ray = raycaster.createRay({
      origin: {
        x: this.player.x,
        y: this.player.y,
      },
    });

    obstacles = this.add.group();
    createObstacles(this);

    raycaster.mapGameObjects(obstacles.getChildren());

    ray.setConeDeg(60);

    intersections = ray.castCone();

    graphics = this.add.graphics({
      lineStyle: { width: 1, color: 0x00ff00 },
      fillStyle: { color: 0xffffff, alpha: 0.3 },
    });

    draw();
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

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.reticle.x,
      this.reticle.y,
    );

    this.player.rotation = angle;

    ray.origin = { x: this.player.x, y: this.player.y };

    ray.setAngle(angle);
    intersections = ray.castCone();
    draw();
  }
}

//create obstacles
function createObstacles(scene) {
  //create rectangle obstacle
  let obstacle = scene.add
    .rectangle(100, 100, 75, 75)
    .setStrokeStyle(1, 0xff0000);
  obstacles.add(obstacle, true);

  //create line obstacle
  obstacle = scene.add
    .line(400, 100, 0, 0, 200, 50)
    .setStrokeStyle(1, 0xff0000);
  obstacles.add(obstacle);

  //create circle obstacle
  obstacle = scene.add.circle(650, 100, 50).setStrokeStyle(1, 0xff0000);
  obstacles.add(obstacle);

  //create polygon obstacle
  obstacle = scene.add
    .polygon(650, 500, [0, 0, 50, 50, 100, 0, 100, 75, 50, 100, 0, 50])
    .setStrokeStyle(1, 0xff0000);
  obstacles.add(obstacle);

  //create overlapping obstacles
  for (let i = 0; i < 5; i++) {
    obstacle = scene.add
      .rectangle(350 + 30 * i, 550 - 30 * i, 50, 50)
      .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle, true);
  }

  //create image obstacle
  obstacle = scene.add.image(100, 500, "crate");
  obstacles.add(obstacle, true);
}

function draw() {
  //add ray origin to intersections to create full polygon
  intersections.push(ray.origin);
  graphics.clear();
  graphics.fillStyle(0xffffff, 0.3);
  graphics.fillPoints(intersections);
  for (let intersection of intersections) {
    graphics.strokeLineShape({
      x1: ray.origin.x,
      y1: ray.origin.y,
      x2: intersection.x,
      y2: intersection.y,
    });
  }
  graphics.fillStyle(0xff00ff);
  graphics.fillPoint(ray.origin.x, ray.origin.y, 3);
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
