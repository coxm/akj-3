import {GameObjects} from 'phaser';

import {
  tilesetName, invaderFrame, invaderSpeed,
  invaderAttackStrength as attackStrength,
  invaderAttackRadius as attackRadius,
} from '../settings';
import {distance} from '../util';


export const modeNone = 0;
export const modeMoving = 1;
export const modeAttacking = 2;


export class Invader extends GameObjects.Sprite {
  constructor(level, x, y, frameIndex, properties) {
    super(level, x, y, tilesetName, frameIndex);
    this.speed = properties.speed;
    this.attackRadius = properties.attackRadius;
    this.attackStrength = properties.attackStrength;
    this.target = properties.target;
    this.health = this.maxHealth = properties.maxHealth;
    this.mode = modeNone;
  }

  approachTarget() {
    const signX = Math.sign(this.target.x - this.x);
    const signY = Math.sign(this.target.y - this.y);
    this.body.setVelocity(
      Math.floor(this.speed * signX),
      Math.floor(this.speed * signY));
    this.mode = modeMoving;
  }

  attackTarget() {
    // TODO: play an animation.
    const dist = distance(this.x, this.y, this.target.x, this.target.y);
    if (dist < this.attackRadius) {
      this.target.health -= this.attackStrength;
      this.mode = modeAttacking;
    }
    else {
      this.mode = modeMoving;
    }
  }

  update(time, delta) {
    const dist = distance(this.x, this.y, this.target.x, this.target.y);
    if (dist < this.attackRadius) {
      this.attackTarget();
    }
    else {
      this.approachTarget();
    }
  }
}
