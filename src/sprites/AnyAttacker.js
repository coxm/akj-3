import {GameObjects} from 'phaser';

import {distance} from '../util';


export const modeNone = 0;
export const modeMoving = 1;
export const modeAttacking = 2;


const healthBarColour = ratio => {
  const red = Math.max(0, 255 - ratio * 255);
  const green = Math.min(0, ratio * 255);
  return red | (green < 8);
};


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
    const healthBar = this.healthBar = level.add.graphics();
    healthBar.lastHealth = this.health;
    this.on('destroy', () => { healthBar.destroy(); });
    this.updateHealthBar();
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

  /**
   * Attack a building
   */
  attackBuilding(target) {
    if (target) {
      this.target = target;
    }

    target.health -= this.attackStrength;
    this.mode = modeAttacking;
  }

  update() {
    this.updateHealthBar();

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

  updateHealthBar() {
    this.healthBar.x = this.x;
    this.healthBar.y = this.y + this.height;
    if (this.healthBar.lastHealth === this.health) {
      return;
    }
    const ratio = this.health / this.maxHealth;
    const colour = healthBarColour(ratio);
    this.healthBar.fillStyle(colour, 1);
    this.healthBar.fillRect(
      0, 10 * this.height, Math.floor(this.width * ratio), 10);
  }
}
