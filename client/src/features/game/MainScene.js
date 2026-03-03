import Phaser from 'phaser';
import useGameStore from '../../store/useGameStore';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/littleroot_town.json');
    this.load.image('tiles', '/assets/tilesets/littleroot_town_tileset.png');
    
    this.load.spritesheet('player_down', '/assets/sprites/player_down.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_up', '/assets/sprites/player_up.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_left', '/assets/sprites/player_left.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    // Tiled içindeki Tileset adıyla eşleştiğinden emin ol
    const tileset = map.addTilesetImage('littleroot_town_tileset', 'tiles');
    
    map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collisions', tileset, 0, 0);

    // ÇÖZÜM: Katmandaki boş olmayan her şeyi engel yapar (Property aramaz)
    collisionLayer.setCollisionByExclusion([-1]);

    const { posX, posY } = useGameStore.getState();

    // Debug Görselleştirme (Artık turuncu kutuları görmelisin)
    const debugGraphics = this.add.graphics().setAlpha(0.7);
    collisionLayer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });

    this.player = this.physics.add.sprite(posX || 200, posY || 200, 'player_down');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);

    // Çarpışma Kutusu Ayarı: Daha iyi bir Pokémon hissi için (Ayak kısmına odaklı)
    this.player.body.setSize(16, 12);
    this.player.body.setOffset(0, 20);

    this.physics.add.collider(this.player, collisionLayer);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Animasyonlar
    this.createAnimations();
  }

  createAnimations() {
    const directions = ['down', 'up', 'left'];
    directions.forEach(dir => {
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers(`player_${dir}`, { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  // ESLint parametre hatası vermemesi için boş bıraktık
  update() {
    if (!this.player || !this.cursors) return;

    const speed = 120;
    this.player.setVelocity(0);

    // Arayüz açık mı kontrol et
    const { ui } = useGameStore.getState();
    if (ui.isPokedexOpen || ui.isBagOpen || ui.isDetailOpen) {
      this.player.setVelocity(0);
      this.player.anims.stop();
      this.player.setFrame(0);
      return; 
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
      this.player.setFlipX(false);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk-left', true);
      this.player.setFlipX(true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('walk-up', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('walk-down', true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(0);
    }

    if (this.player.body.speed > 0) {
      this.player.body.velocity.normalize().scale(speed);
      this.updateZustandPosition();
    }
  }

  updateZustandPosition() {
    useGameStore.getState().setPosition(this.player.x, this.player.y);
  }
}