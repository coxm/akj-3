import {GameObjects} from 'phaser';

import {tilesetName, towerFrame, towerMaxHealth} from '../settings';


export class Tower extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, towerFrame);
    this.health = this.maxHealth = towerMaxHealth;
  }
}
