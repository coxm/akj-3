import {GameObjects} from 'phaser';

import {tilesetName, wallFrame, wallMaxHealth} from '../settings';


export class Wall extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, wallFrame);
    this.health = this.maxHealth = wallMaxHealth;
    this.wallTop = level.add.sprite(x,y-32,tilesetName);
    this.wallTop.setDepth(10);
    this.setDepth(11);
    this.on('destroy', () => { this.wallTop.destroy(); });
  }
}
