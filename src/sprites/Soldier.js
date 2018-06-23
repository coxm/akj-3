import {GameObjects} from 'phaser';

import {tilesetName, soldierFrame} from '../settings';


export class Soldier extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, soldierFrame);
  }
}
