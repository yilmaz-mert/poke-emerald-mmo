import Phaser from 'phaser';
import useGameStore from '../../store/useGameStore';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
    this.topLayer = null;
    this.lastSentX = 0;
    this.lastSentY = 0;
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/littleroot_8x8.json');
    this.load.image('tiles', '/assets/tilesets/littleroot_8x8_tileset.png');
    this.load.spritesheet('player_down', '/assets/sprites/player_down.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_up', '/assets/sprites/player_up.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_left', '/assets/sprites/player_left.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('littleroot_8x8_tileset', 'tiles');
    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    groundLayer.setDepth(0);

    const collisionLayer = map.createLayer('Collisions', tileset, 0, 0);
    collisionLayer.setDepth(1);
    collisionLayer.setCollisionByExclusion([-1]);

    const { posX, posY } = useGameStore.getState();

    // Karakter Oluşturma
    this.player = this.physics.add.sprite(posX || 200, posY || 200, 'player_down');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    
    // 16x8 Hitbox (Ayak kısmı)
    this.player.body.setSize(16, 8);
    this.player.body.setOffset(0, 24);
    
    // Başlangıç derinliği
    this.player.setDepth(11); 

    this.topLayer = map.createLayer('Top', tileset, 0, 0);
    this.topLayer.setDepth(10); // Sabit 10

    this.physics.add.collider(this.player, collisionLayer);

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 120;
    this.player.setVelocity(0);

    const { ui } = useGameStore.getState();
    if (ui.isPokedexOpen || ui.isBagOpen || ui.isDetailOpen) {
      this.player.anims.stop();
      this.player.setFrame(0);
      return; 
    }

    // Hareket Kontrolleri
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
      this.player.x = Math.round(this.player.x);
      this.player.y = Math.round(this.player.y);
      this.updateZustandPosition();
    }

    // --- GELİŞMİŞ Z-SORTING (ÖN-ARKA AYARI) ---
    
    // Varsayılan: Oyuncu tabelanın/evlerin önündedir (Depth: 11)
    this.player.setDepth(11);

    const bounds = this.player.getBounds();
    // Karakterin sprite'ının değdiği tüm Top katmanı tile'larını alıyoruz
    const overlappingTiles = this.topLayer.getTilesWithinWorldXY(
      bounds.x, 
      bounds.y, 
      bounds.width, 
      bounds.height, 
      { isNotEmpty: true }
    );

    for (const tile of overlappingTiles) {
      const tileBottom = tile.pixelY + tile.height;
      
      // Eğer karakterin ayakları (this.player.y), değdiği herhangi bir 
      // üst katman objesinin alt sınırından yukarıdaysa (kuzeyindeyse)...
      if (this.player.y <= tileBottom) {
        // ...karakter o objenin arkasındadır.
        this.player.setDepth(5);
        break; // Bir tane bile "arkasında" olduğu tile bulursak derinliği düşürüp döngüden çıkıyoruz
      }
    }
  }

  updateZustandPosition() {
    const x = Math.round(this.player.x);
    const y = Math.round(this.player.y);
    if (this.lastSentX !== x || this.lastSentY !== y) {
      useGameStore.getState().setPosition(x, y);
      this.lastSentX = x;
      this.lastSentY = y;
    }
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
}