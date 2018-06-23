import {GameObjects} from 'phaser';

import {tilesetName, colonistFrame} from '../settings';


export class Colonist extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, colonistFrame);
  }
}
