import {GameObjects} from 'phaser';

import {tilesetName, invaderFrame, invaderSpeed} from '../settings';


export class Invader extends GameObjects.Sprite {
  constructor(level, x, y, target) {
    super(level, x, y, tilesetName, invaderFrame);
  }

  approachTarget(target) {
    this.target = target;
    const signX = Math.sign(this.target.x - this.x);
    const signY = Math.sign(this.target.y - this.y);
    if (signX !== 0 || signY !== 0) {
      this.body.setVelocity(
        Math.floor(invaderSpeed * signX),
        Math.floor(invaderSpeed * signY));
    }
  }

  update(time, delta) {
  }
}
