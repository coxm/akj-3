import {GameObjects} from 'phaser';

import {tilesetName, ditchFrame, ditchMaxHealth} from '../settings';


export class Ditch extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, ditchFrame);
    this.health = this.maxHealth = ditchMaxHealth;
  }
}
