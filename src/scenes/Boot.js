import {Scene, Tilemaps} from 'phaser';

import level0Tilemap from '../tilemaps/Level0.json';


export class Boot extends Scene {
  preload() {
    for (const levelName of ['Level0']) {
      this.cache.tilemap.entries.set(`tilemap:${levelName}`, {
        format: Tilemaps.Formats.TILED_JSON,
        data: level0Tilemap,
      });
    }
    this.load.spritesheet('apoc16x16-img', 'assets/img/apocalypse.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 0,
    });

    // Load images here. Prefer to import JSON and other text assets into the
    // bundle.
    this.load.on('complete', () => {
      console.log('Loaded');
      this.scene.start('Title');
    });
  }
}
