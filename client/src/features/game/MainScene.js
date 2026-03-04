import Phaser from 'phaser';
import useGameStore from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
    this.shiftKey = null;
    this.topLayer = null;
    this.groundLayer = null; 
    this.lastSentX = 0;
    this.lastSentY = 0;
    this.animatedTiles = []; 
    this.charType = 'brendan';
  }

  preload() {
    const version = Date.now();
    this.load.tilemapTiledJSON('map', `/assets/tilemaps/littleroot_8x8.json?v=${version}`);
    this.load.image('tiles', `/assets/tilesets/littleroot_8x8_tileset.png?v=${version}`);
    
    // Atlas ve meta verileri için JSON yüklemesi
    this.load.atlas('players', '/assets/sprites/players.png', '/assets/sprites/players.json');
    this.load.json('players_json', '/assets/sprites/players.json'); 
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
    const { user } = useAuthStore.getState();
    
    // AuthStore'dan gelen karakter seçimi
    this.charType = user?.avatar || 'brendan'; 

    // Başlangıç karesini atlas verisine göre seçiyoruz
    const startFrame = this.charType === 'may' ? 'players 25.png' : 'players 1.png';

    this.player = this.physics.add.sprite(posX || 200, posY || 200, 'players', startFrame);
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    
    // FİZİKSEL KUTU AYARI: Karakteri 48x64 içinde ortalayıp ayaklara sabitler
    this.player.body.setSize(16, 8);
    this.player.body.setOffset(16, 40); 
    this.player.setDepth(11);

    this.topLayer = map.createLayer('Top', tileset, 0, 0);
    this.topLayer.setDepth(10);

    this.physics.add.collider(this.player, collisionLayer);

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.createAnimations();
    this.initAnimatedTiles(map);
  }

  update(time, delta) { 
    if (!this.player || !this.cursors) return;

    this.updateAnimatedTiles(delta); // ESLint: delta burada kullanılıyor

    const { ui } = useGameStore.getState();
    if (ui.isPokedexOpen || ui.isBagOpen || ui.isDetailOpen) {
      this.player.anims.stop();
      return; 
    }

    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 180 : 120; 
    const action = isRunning ? 'run' : 'walk';

    this.player.setVelocity(0);
    let movingDir = '';

    if (this.cursors.left.isDown) { this.player.setVelocityX(-speed); movingDir = 'left'; }
    else if (this.cursors.right.isDown) { this.player.setVelocityX(speed); movingDir = 'right'; }
    else if (this.cursors.up.isDown) { this.player.setVelocityY(-speed); movingDir = 'up'; }
    else if (this.cursors.down.isDown) { this.player.setVelocityY(speed); movingDir = 'down'; }

    if (movingDir) {
      this.player.anims.play(`${this.charType}_${action}_${movingDir}`, true);
    } else {
      this.player.anims.stop();
      if (this.player.anims.currentAnim) {
        const frames = this.player.anims.currentAnim.frames;
        if(frames.length > 1) this.player.setFrame(frames[1].textureFrame); 
      }
    }

    // DERİNLİK (TOP LAYER) DÜZELTMESİ
    this.player.setDepth(11);
    const body = this.player.body;
    // Sadece fiziksel kutunun bastığı yerdeki tile'ları kontrol et
    const overlappingTiles = this.topLayer.getTilesWithinWorldXY(body.x, body.y, body.width, body.height, { isNotEmpty: true });

    for (const tile of overlappingTiles) {
      const tileBottom = tile.pixelY + tile.height;
      // Kıyaslamayı ayakların bittiği yerle yap
      if (body.bottom <= tileBottom) {
        this.player.setDepth(5);
        break; 
      }
    }

    if (this.player.body.speed > 0) {
      this.updateZustandPosition();
    }
  }

  createAnimations() {
    const atlasData = this.cache.json.get('players_json');
    if (!atlasData || !atlasData.meta || !atlasData.meta.frameTags) return;

    atlasData.meta.frameTags.forEach(tag => {
      if (tag.name.includes('walk') || tag.name.includes('run')) {
        this.anims.create({
          key: tag.name, 
          frames: this.anims.generateFrameNames('players', {
            prefix: 'players ',
            start: tag.from,
            end: tag.to,
            suffix: '.png'
          }),
          frameRate: tag.name.includes('run') ? 12 : 8, 
          repeat: -1
        });
      }
    });
  }

  initAnimatedTiles(map) {
    this.animatedTiles = [];
    map.tilesets.forEach(tileset => { // ESLint: map burada kullanılıyor
      const tileData = tileset.tileData;
      if (tileData) {
        for (let tileid in tileData) {
          if (tileData[tileid].animation) {
            const animData = tileData[tileid].animation;
            this.animatedTiles.push({
              currentFrame: 0,
              elapsedTime: 0,
              frames: animData.map(f => ({
                gid: f.tileid + tileset.firstgid, 
                duration: f.duration
              }))
            });
          }
        }
      }
    });
  }

  updateAnimatedTiles(delta) {
    this.animatedTiles.forEach(anim => {
      anim.elapsedTime += delta;
      const currentFrameData = anim.frames[anim.currentFrame];
      if (anim.elapsedTime >= currentFrameData.duration) {
        anim.elapsedTime -= currentFrameData.duration;
        const oldGid = currentFrameData.gid;
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
        const newGid = anim.frames[anim.currentFrame].gid;
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
}