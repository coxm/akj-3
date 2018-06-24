import {Scene, Tilemaps} from 'phaser';

import {tilesetName} from '../settings';
import level0Tilemap from '../tilemaps/Level0.json';

import makeAnimations from '../animations';

export class Boot extends Scene {
  preload() {
    const progress = this.add.graphics();
       
    // Register a load progress event to show a load bar
    this.load.on('progress', (value) => {
        progress.clear();
        progress.fillStyle(0x444444, 1);
        progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 40);
    });

    // Register a load complete event to launch the title screen when all files are loaded
    this.load.on('complete', () => {
        // prepare all animations, defined in a separate file
        makeAnimations(this);
        progress.destroy();
        console.log('Loaded');
        this.scene.start(__FIRST_SCENE__);
    });

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
  }
}
