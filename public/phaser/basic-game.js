const BULLET_SPEED = 3;
const BULLET_VELOCITY_FACTOR = 1000;

var obstacles;
var raycaster;
var ray;
var intersections;
var graphics;

/*
 * Things that should be communicated to the server:
 *
 * - Player position and orientation (x, y, angle)
 * - Player action (shooting, moving, etc)
 * - Flashlight on or off (can be rendered based off of position and angle)
 * - Rest of player state (health, ammo, etc.,)
 *
 * Things recieved from the backend:
 *
 * - Enemy state (position, orientation, action, flashlight, etc.,)
 * - Player initial starting position
 * - Lobby-wide rules or settings
 * */

class Example extends Phaser.Scene {
  player;
  cursors;
  flashLightIsOn;

  constructor() {
    super("wg-demo");

    this.player = null;
    this.flashLightIson = false;
  }

  preload() {
    //   this.load.image("sky", "https://labs.phaser.io/assets/skies/space3.png");
    //    this.load.image(
    //      "logo",
    //      "https://labs.phaser.io/assets/sprites/phaser3-logo.png",
    //    );
    //    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");

    this.load.spritesheet(
      "handgunSprite",
      "./phaser/assets/SpritesheetGuns.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );

    this.load.spritesheet(
      "iconsAndParticles",
      "./phaser/assets/IconsAndParticles.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
  }

  create() {
    const x = 400;
    const y = 300;

    this.reticle = this.physics.add.sprite(x, y, "iconsAndParticles", 10);
    this.reticle.setCollideWorldBounds(true);
    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.player = this.physics.add.sprite(x, y, "handgunSprite", 2);
    this.enemy = this.physics.add.sprite(x - 200, y, "handgunSprite", 2);
    this.enemy.setSize(50, 40);
    this.player.setCollideWorldBounds(true);
    this.enemy.setCollideWorldBounds(true);

    this.anims.create({
      key: "handgunShoot",
      frames: this.anims.generateFrameNumbers("handgunSprite", {
        frames: [2, 3, 2],
      }),
      frameRate: 30,
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

    // Needed to keep the reticle locked relative to the screen when the camera moves.
    this.prevCamScrollX = this.cameras.main.scrollX;
    this.prevCamScrollY = this.cameras.main.scrollY;

    // Move reticle upon locked pointer move
    this.input.on("pointermove", (pointer) => {
      if (this.input.mouse.locked) {
        // Reticle does not move on the screen when the game camera moves.
        this.reticle.x += pointer.movementX;
        this.reticle.y += pointer.movementY;
      }
    });

    this.input.keyboard.on(
      "keydown-F",
      () => {
        if (this.flashLightIsOn) {
          this.flashLightIsOn = false;
        } else {
          this.flashLightIsOn = true;
        }
      },
      this,
    );

    raycaster = this.raycasterPlugin.createRaycaster();

    ray = raycaster.createRay({
      origin: {
        x: this.player.x,
        y: this.player.y,
      },
    });

    obstacles = this.physics.add.staticGroup();
    createObstacles(this);

    this.physics.add.collider(this.player, obstacles);

    this.input.on("pointerdown", (pointer, time, lastFired) => {
      if (this.player.active === false) {
        return;
      }

      // Get bullet from bullets group
      const bullet = this.playerBullets.get().setActive(true).setVisible(true);

      if (bullet) {
        bullet.fire(this.player, this.reticle);
        this.physics.add.overlap(
          this.enemy,
          bullet,
          () => {
            console.log("enemy hit, lol");
            bullet.destroy();
          },
          //  this.enemyHitCallback(enemyHit, bulletHit),
        );
        this.physics.add.collider(obstacles, bullet, () => {
          console.log("obstacle hit");
          bullet.destroy();
        });
      }
    });

    raycaster.mapGameObjects(obstacles.getChildren());

    ray.setConeDeg(60);

    intersections = ray.castCone();

    graphics = this.add.graphics({
      lineStyle: { width: 1, color: 0x00ff00 },
      fillStyle: { color: 0xffffff, alpha: 0.3 },
    });

    const mask = graphics.createGeometryMask();

    this.enemy.setMask(mask);

    if (this.flashLightIsOn) {
      draw();
    }
  }

  update() {
    // Movement with arrow keys
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
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

    if (this.flashLightIsOn) {
      draw();
    } else {
      graphics.clear();
    }

    // Updating reticle position
    if (this.input.mouse.locked) {
      const deltaX = this.cameras.main.scrollX - this.prevCamScrollX;
      const deltaY = this.cameras.main.scrollY - this.prevCamScrollY;

      this.reticle.x += deltaX;
      this.reticle.y += deltaY;
    }

    this.prevCamScrollX = this.cameras.main.scrollX;
    this.prevCamScrollY = this.cameras.main.scrollY;
  }
}

function createEnemy(scene) {}

//create obstacles
//can use this later to create walls and cover
function createObstacles(scene) {
  //create rectangle obstacle
  let obstacle = scene.add
    .rectangle(100, 100, 80, 80)
    .setStrokeStyle(1, 0xff0000);
  obstacles.add(obstacle, true);

  obstacle = scene.add.rectangle(100, 180, 80, 80).setStrokeStyle(1, 0xff0000);
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
  // Flashlight COLOR
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

class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene) {
    super(scene, 0, 0, "iconsAndParticles", 9);
    this.speed = BULLET_SPEED;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    //this.setSize(16, 16);
  }

  fire(shooter, target) {
    this.setPosition(shooter.x, shooter.y); // Initial position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction);
      this.ySpeed = this.speed * Math.cos(this.direction);
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }
    // play animation
    shooter.play("handgunShoot", true);
    // TODO Will need to change this to setting bullet velocity, instead of
    // relying on updates below.
    this.setVelocityX(this.xSpeed * BULLET_VELOCITY_FACTOR);
    this.setVelocityY(this.ySpeed * BULLET_VELOCITY_FACTOR);
    this.rotation = shooter.rotation; // angle bullet with shooters rotation
    this.born = 0; // Time since new bullet spawned
  }

  // TODO change to velocity based instead of manual change. This is messing
  // up hit detection.
  update(time, delta) {
    //this.x += this.xSpeed * delta;
    //this.y += this.ySpeed * delta;
    this.born += delta;
    if (this.born > 1800) {
      this.setActive(false);
      this.setVisible(false);
    }
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
      debug: true, // Need to set to false later
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
