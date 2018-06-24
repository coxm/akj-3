import {Scene, Tilemaps} from 'phaser';

import {tilesetName} from '../settings';
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
      frameWidth: 16,
      frameHeight: 16,
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
