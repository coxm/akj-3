import {Scene} from 'phaser';

import {
  tilesetName, wallFrame, tileWidth, tileHeight,
} from '../settings';
import {Wall} from '../sprites/Wall';


const placementModeInfo = {
  wall: {
    sprite: null,
    frame: wallFrame,
    create(level, x, y) {
      return new Wall(level, x, y);
    },
  },
};


const tilePositionOfPixels = (x, y) => [
  Math.floor(x / tileWidth + 0.5),
  Math.floor(y / tileHeight + 0.5)
];


const pixelTopLeftOfTile = (x, y) => [x * tileWidth, y * tileHeight];


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
      actors: this.add.group(),
    };

    this.placingObject = null; // {id: string; sprite: Sprite;}
    this.createInput();
  }

  createInput() {
    this.input.keyboard.on('keydown_W', () => this.enterPlacementMode('wall'));
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
    const sprite = details.sprite;
    sprite.visible = true;
    sprite.active = true;
    this.placingObject = {id, sprite};
    this.input.on('pointerdown', this.attemptObjectPlacement, this);
  }

  attemptObjectPlacement() {
    const [tileX, tileY] = tilePositionOfPixels(
      this.input.mousePointer.x, this.input.mousePointer.y);

    if (this.getObjectInTile(tileX, tileY)) {
      __DEV__ && console.log('Something already occupies that tile!');
      // TODO: play a sound effect or something?
      return;
    }

    this.input.off('pointerdown', this.attemptObjectPlacement, this);
    const createSprite = placementModeInfo[this.placingObject.id].create;
    const [x, y] = pixelTopLeftOfTile(tileX, tileY);
    this.groups.actors.add(createSprite(this, x, y), true);
    this.placingObject.sprite.active = false;
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

  /**
   * Get the sprite in a tile position, or null if the tile is empty.
   *
   * @returns {Phaser.GameObjects.Sprite | null}
   */
  getObjectInTile(tileX, tileY) {
    for (const sprite of this.groups.actors.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }
    return null;
  }
}