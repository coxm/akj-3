import {GameObjects} from 'phaser';

import {tilesetName, ditchFrame} from '../settings';


export class Ditch extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, ditchFrame);
  }
}