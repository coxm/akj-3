import {Scene, Tilemaps} from 'phaser';

import {
  tilesetName, twigProperties, flowerProperties, colonistProperties,
  soldierProperties,
} from '../settings';

import level0Tilemap from '../tilemaps/Level0.json';


__DEV__ && Object.assign(window, {
  tilemap: level0Tilemap,
});


export class Boot extends Scene {
  preload() {
    for (const levelName of ['Level0']) {
      this.cache.tilemap.entries.set(`tilemap:${levelName}`, {
        format: Tilemaps.Formats.TILED_JSON,
        data: level0Tilemap,
      });
    }
    this.load.spritesheet(tilesetName, 'assets/img/tileset.png', {
      frameWidth: 32,
      frameHeight: 32,
      spacing: 0,
    });
    this.load.spritesheet(twigProperties.tileset, 'assets/img/twig_monster.png', {
      frameWidth: 32,
      frameHeight: 32,
      spacing: 0,
    });
    this.load.spritesheet(flowerProperties.tileset, 'assets/img/flower_monster.png', {
      frameWidth: 64,
      frameHeight: 64,
      spacing: 0,
    });
    this.load.spritesheet(colonistProperties.tileset, 'assets/img/farmer.png', {
      frameWidth: 32,
      frameHeight: 32,
      spacing: 0,
    });
    this.load.spritesheet(soldierProperties.tileset, 'assets/img/soldier.png', {
      frameWidth: 32,
      frameHeight: 32,
      spacing: 0,
    });

    // Load images here. Prefer to import JSON and other text assets into the
    // bundle.
    this.load.image('ui-img', 'assets/img/ui.png');
    this.load.image('title', 'assets/img/title_screen_the_growth.png');
    this.load.image('barracks', 'assets/img/buildings/plain.png');
    this.load.image('farm', 'assets/img/buildings/farm_building.png');
    this.load.image('townHall', 'assets/img/buildings/town_hall.png');
    this.load.spritesheet('tower', 'assets/img/buildings/watch_tower_2x2.png', {
      frameWidth: 64,
      frameHeight: 80,
      spacing: 0,
    });
    this.load.image('towerHouse', 'assets/img/buildings/tower_building.png');
    this.load.image('wallHouse', 'assets/img/buildings/wall_building.png');

    this.load.spritesheet('wall', 'assets/img/buildings/bambo_fence_thick.png', {
      frameWidth: 32,
      frameHeight: 32,
      spacing: 0,
    });

    this.load.spritesheet('ui', 'assets/img/ui.png', {
      frameWidth: 128,
      frameHeight: 64,
      spacing: 0,
    });

    this.load.audio("intro-theme", ["/assets/sfx/intro-theme.ogg"]);
    this.load.audio("main-theme", ["/assets/sfx/main-theme.ogg"]);
    this.load.audio("main-theme-dramatic", ["/assets/sfx/main-theme-dramatic.ogg"]);

    this.anims.create({
      key: 'flower_attack_right',
      frames: this.anims.generateFrameNumbers('flower-monster', { start: 60, end: 79 }),
      frameRate: 10,
      repeat: -1
    });


    this.load.on('complete', () => {
      console.log('Loaded');
      this.scene.start(__FIRST_SCENE__);
    });
  }
}
