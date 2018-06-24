import {Scene, Tilemaps} from 'phaser';

import {
  tilesetName, twigProperties, flowerProperties, colonistProperties,
  soldierProperties,
} from '../settings';
import level0Tilemap from '../tilemaps/Level0.json';


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

    this.load.spritesheet('ui', 'assets/img/ui.png', {
      frameWidth: 128,
      frameHeight: 64,
      spacing: 0,
    });

    this.load.on('complete', () => {
      console.log('Loaded');
      this.scene.start(__FIRST_SCENE__);
    });
  }
}
