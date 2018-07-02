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
export class AnyAttacker extends Phaser.Physics.Arcade.Sprite {
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
    this.healthBar = level.add.graphics();
    this.level = level;
//    this.healthBar.fillStyle(0x999999, 1);
//  this.healthBar.fillRect(300, 150, 100, 100);
    this.healthBar.lastHealth = this.health;
    this.on('destroy', () => { this.healthBar.destroy(); });
    this.updateHealthBar(true);
        this.once = true;


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
    this.body.setVelocity(0,0);

    const signX = Math.sign(this.target.x - this.x);
    const signY = Math.sign(this.target.y - this.y);

//    let collision = this.level.physics.world.collide(
  //        this,
    //      this.level.groups.actors);
//    console.log(this.body.wasTouching.down || this.body.touching.down);

//super.setVelocity(this.speed * signX);
//this.setVelocityY(this.speed * signY);

//console.log(signX + " / " + signY + " : " + this.body.touching.left);
    if (!(this.body.touching.down) && signY>0) {
      this.body.velocity.y = this.speed * signY;
    }
    if (!(this.body.touching.up) && signY<0) {
      this.body.velocity.y = this.speed * signY;
    }
    if (!(this.body.touching.left) && signX<0) {
      this.body.velocity.x = this.speed * signX;
    }
    if (!(this.body.touching.right) && signX>0) {
      this.body.velocity.x = this.speed * signX;
    }
  //}
    if (false) {

    this.setVelocity(
      Math.floor(this.speed * signX),
      Math.floor(this.speed * signY));
  }
    this.mode = modeMoving;
    this.once = false;
  }

  stop() {
    this.body.setVelocity(0,0);

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
      if (this.body.velocity.x < 0.1 && this.body.velocity.y < 0.1) {
        this.approachTarget();
      }
    }
    if (this.health<1) {
      this.destroy();
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
    this.healthBar.fillRect(
      -1, -1, this.width+2, 7);
    this.healthBar.fillStyle(0x008800, 1);
    this.healthBar.fillRect(
      0, 0, Math.floor(this.width * ratio), 5);
  }
}
