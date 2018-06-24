import {GameObjects} from 'phaser';

import {distance} from '../util';


export const modeNone = 0;
export const modeMoving = 1;
export const modeAttacking = 2;


/**
 * Any Sprite class that can attack and approach other things.
 *
 * Extended by most other sprites (friendly or not).
 */
export class AnyAttacker extends GameObjects.Sprite {
  constructor(level, x, y, properties) {
    console.assert(typeof properties.tileset === 'string', 'Invalid tileset');
    console.assert(typeof properties.frame === 'number', 'Invalid frame');
    super(level, x, y, properties.tileset, properties.frameIndex);
    this.speed = properties.speed;
    this.attackRadius = properties.attackRadius;
    this.attackStrength = properties.attackStrength;
    this.target = properties.target;
    this.health = this.maxHealth = properties.maxHealth;
    this.mode = modeNone;
    this.isFriendly = properties.isFriendly;
  }

  /**
   * Approach a target.
   *
   * @param {Target} [target] - the target to approach. Defaults to the
   * existing target if none given.
   */
  approachTarget(target) {
    if (target) {
      this.target = target;
    }
    const signX = Math.sign(this.target.x - this.x);
    const signY = Math.sign(this.target.y - this.y);
    this.body.setVelocity(
      Math.floor(this.speed * signX),
      Math.floor(this.speed * signY));
    this.mode = modeMoving;
  }

  /**
   * Attack a target.
   *
   * @param {Target} [target] - the target to attack. Defaults to the existing
   * target if none given.
   */
  attackTarget(target) {
    if (target) {
      this.target = target;
    }

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

  update() {
    if (!this.target) {
      // It's valid for some (e.g. player-owned) units not to have a target.
      return;
    }

    const dist = distance(this.x, this.y, this.target.x, this.target.y);
    if (dist < this.attackRadius) {
      this.attackTarget();
    }
    else {
      this.approachTarget();
    }
  }
}
