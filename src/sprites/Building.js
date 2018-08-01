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
export class Building extends Phaser.Physics.Arcade.Sprite { // TODO what?
  constructor(level, x, y, properties) {
    console.assert(typeof properties.tileset === 'string', 'Invalid tileset');
    console.assert(typeof properties.frame === 'number', 'Invalid frame');
    super(level, x, y, properties.tileset, properties.frameIndex);
    this.tileset = properties.tileset;
    this.speed = properties.speed;
    this.attackRadius = properties.attackRadius;
    this.attackStrength = properties.attackStrength;
    this.target = properties.target;
    this.health = this.maxHealth = properties.maxHealth;
    this.mode = modeNone;
    this.isFriendly = properties.isFriendly;
    this.healthBar = level.add.graphics();
    this.level = level;
    this.setFrame(properties.frame);
//    this.healthBar.fillStyle(0x999999, 1);
//  this.healthBar.fillRect(300, 150, 100, 100);
    this.healthBar.lastHealth = this.health;
    this.healthBar.setDepth(9);

    this.on('destroy', () => { this.healthBar.destroy(); });
    this.updateHealthBar(true);
        this.once = true;

    if (properties.tileset=== "wall") {
      this.wallTop = level.add.sprite(x,y-32,properties.tileset);
      this.wallTop.setDepth(10);
      this.wallTop.setFrame(0);
      this.on('destroy', () => { this.wallTop.destroy(); });
// animate: struct.alpha = struct.health / struct.maxHealth; ehh
    }

  }

  /**
   * Approach a target.
   *
   * @param {Target} [target] - the target to approach. Defaults to the
   * existing target if none given.
   */
  approachTarget(target) {
    
  }

  stop() {
    this.setVelocity(0,0);

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


// TODO : do we need this?
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
      if (this.body.velocity.x < 0.1 && this.body.velocity.y < 0.1) {
        this.approachTarget();
      }
    }
    if (this.health<1) {
      this.kill();
    }
  }

  updateHealthBar(forceUpdate = false) {
    this.healthBar.x = this.x - this.width/2;
    this.healthBar.y = this.y - this.height/2 - 10;

    if (!forceUpdate && this.healthBar.lastHealth === this.health) {
      return;
    }
    const ratio = this.health / this.maxHealth;
    const colour = healthBarColour(ratio);
    this.healthBar.fillStyle(0x000000, 1);
    this.healthBar.fillRect(-1, -1, this.width+2, 7);
    this.healthBar.fillStyle(0x008800, 1);
    this.healthBar.fillRect(0, 0, Math.floor(this.width * ratio), 5);
  }
}
