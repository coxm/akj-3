import {GameObjects} from 'phaser';

import {tilesetName, invaderFrame} from '../settings';


export class Invader extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, invaderFrame);
    this.speed = 0.5;
  }

  update(time, delta) {
    const signX = Math.sign(this.target.x - this.x);
    const signY = Math.sign(this.target.y - this.y);
    if (signX !== 0 || signY !== 0) {
      this.body.setVelocity(
        Math.floor(delta * this.speed * signX),
        Math.floor(delta * this.speed * signY));
    }
  }
}
