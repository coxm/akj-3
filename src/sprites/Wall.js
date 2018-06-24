import {GameObjects} from 'phaser';

import {tilesetName, wallFrame, wallMaxHealth} from '../settings';


export class Wall extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, wallFrame);
    this.health = this.maxHealth = wallMaxHealth;
  }
}
