import {GameObjects} from 'phaser';

import {tilesetName, invaderFrame} from '../settings';


export class Invader extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, invaderFrame);
  }
}
