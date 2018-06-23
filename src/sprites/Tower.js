import {GameObjects} from 'phaser';

import {tilesetName, towerFrame} from '../settings';


export class Tower extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, towerFrame);
  }
}
