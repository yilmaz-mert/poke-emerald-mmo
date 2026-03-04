import Phaser from 'phaser';
import useGameStore from '../../store/useGameStore';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
    this.topLayer = null;
    this.groundLayer = null; 
    this.lastSentX = 0;
    this.lastSentY = 0;
    // Animasyon verilerini tutacağımız dizi
    this.animatedTiles = []; 
  }

  preload() {
    const version = Date.now();
    this.load.tilemapTiledJSON('map', `/assets/tilemaps/littleroot_8x8.json?v=${version}`);
    this.load.image('tiles', `/assets/tilesets/littleroot_8x8_tileset.png?v=${version}`);
    
    this.load.spritesheet('player_down', '/assets/sprites/player_down.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_up', '/assets/sprites/player_up.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_left', '/assets/sprites/player_left.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('littleroot_8x8_tileset', 'tiles');
    
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0);
    this.groundLayer.setDepth(0);

    const collisionLayer = map.createLayer('Collisions', tileset, 0, 0);
    collisionLayer.setDepth(1);
    collisionLayer.setCollisionByExclusion([-1]);

    const { posX, posY } = useGameStore.getState();

    this.player = this.physics.add.sprite(posX || 200, posY || 200, 'player_down');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(16, 8);
    this.player.body.setOffset(0, 24);
    this.player.setDepth(11);

    this.topLayer = map.createLayer('Top', tileset, 0, 0);
    this.topLayer.setDepth(10);

    this.physics.add.collider(this.player, collisionLayer);

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();

    // 1. ADIM: Haritadaki animasyonlu tile'ları bul ve hazırla
    this.initAnimatedTiles(map);
  }

  // Özel Animasyon Başlatıcı Fonksiyonumuz
  initAnimatedTiles(map) {
    this.animatedTiles = [];
    
    map.tilesets.forEach(tileset => {
      const tileData = tileset.tileData;
      if (tileData) {
        for (let tileid in tileData) {
          if (tileData[tileid].animation) {
            const animData = tileData[tileid].animation;
            this.animatedTiles.push({
              currentFrame: 0,
              elapsedTime: 0,
              frames: animData.map(f => ({
                // Tiled Local ID'sini Phaser Global ID'sine (GID) çeviriyoruz
                gid: f.tileid + tileset.firstgid, 
                duration: f.duration
              }))
            });
          }
        }
      }
    });
  }

  // update metoduna 'time' ve 'delta' (geçen süre) parametrelerini ekledik
  update(time, delta) { 
    if (!this.player || !this.cursors) return;

    // 2. ADIM: Her karede çiçekleri kontrol et ve salla
    this.updateAnimatedTiles(delta);

    const speed = 120;
    this.player.setVelocity(0);

    const { ui } = useGameStore.getState();
    if (ui.isPokedexOpen || ui.isBagOpen || ui.isDetailOpen) {
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
      this.player.x = Math.round(this.player.x);
      this.player.y = Math.round(this.player.y);
      this.updateZustandPosition();
    }

    this.player.setDepth(11);
    const bounds = this.player.getBounds();
    const overlappingTiles = this.topLayer.getTilesWithinWorldXY(bounds.x, bounds.y, bounds.width, bounds.height, { isNotEmpty: true });

    for (const tile of overlappingTiles) {
      const tileBottom = tile.pixelY + tile.height;
      if (this.player.y <= tileBottom) {
        this.player.setDepth(5);
        break; 
      }
    }
  }

  // Animasyonların Karelerini Değiştiren Döngü
  updateAnimatedTiles(delta) {
    this.animatedTiles.forEach(anim => {
      anim.elapsedTime += delta;
      const currentFrameData = anim.frames[anim.currentFrame];
      
      // Tiled'da belirlediğin süre (örneğin 450ms) geçtiyse
      if (anim.elapsedTime >= currentFrameData.duration) {
        anim.elapsedTime -= currentFrameData.duration;
        
        const oldGid = currentFrameData.gid;
        
        // Sıradaki kareye geç (133 -> 137 vb.)
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
        const newGid = anim.frames[anim.currentFrame].gid;
        
        // Haritadaki tüm eski çiçek karelerini yenisiyle değiştir (çok performanslıdır)
        this.groundLayer.replaceByIndex(oldGid, newGid);
      }
    });
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