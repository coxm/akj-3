import {Scene} from 'phaser';

import {
  tilesetName, wallFrame,
} from '../settings';


const placementModeInfo = {
  wall: {
    sprite: null,
    frame: wallFrame,
  },
};


export class Level extends Phaser.Scene {
  create() {
    this.add.image(128, 384, 'ui');
    this.offsetX = 256;
    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 16,
      tileHeight: 16,
    });
    this.tileset = this.tilemap.addTilesetImage('apoc16x16', tilesetName);
    this.tileLayers = ['ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, this.offsetX, 0);
      return dict;
    }, {});

    this.groups = {
      placement: this.add.group(),
    };

    this.placingObject = null;
    this.createInput();
  }

  createInput() {
    const enterWallPlacementMode = event => {
      console.log('Placing wall');
      this.enterPlacementMode('wall');
    };
    this.input.keyboard.on('keydown_W', enterWallPlacementMode);
    // TODO: on wall button click, enter wall placement mode.
  }

  enterPlacementMode(id) {
    const pointer = this.input.mousePointer;
    const details = placementModeInfo[id];
    if (!details.sprite) {
      details.sprite = this.add.sprite(
        pointer.x, pointer.y, tilesetName, details.frame);
      this.groups.placement.add(details.sprite);
    }
    details.sprite.visible = true;
    this.placingObject = {id, sprite: details.sprite};
    this.input.on('pointerdown', this.exitPlacementMode, this);
  }

  exitPlacementMode() {
    this.input.off('pointerdown', this.exitPlacementMode, this);
    this.placingObject.sprite.visible = false;
    this.placingObject = null;
  }

  update(time, delta) {
    // Update the 'place object' sprite to the current mouse position.
    if (this.placingObject) {
      const {x, y} = this.input.mousePointer;
      this.placingObject.sprite.setPosition(x, y);
    }
  }
}
