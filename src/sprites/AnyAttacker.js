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
    this.tileset = properties.tileset;
    this.attackRadius = properties.attackRadius;
    this.attackStrength = properties.attackStrength;
    this.attackCreepStrength = properties.attackCreepStrength;
    this.target = properties.target;
    this.health = this.maxHealth = properties.maxHealth;
    this.mode = modeNone;
    this.isFriendly = properties.isFriendly;
    this.healthBar = level.add.graphics();
    this.level = level;
   // this.properties = properties;
//    this.healthBar.fillStyle(0x999999, 1);
//  this.healthBar.fillRect(300, 150, 100, 100);
    this.healthBar.lastHealth = this.health;
    this.healthBar.setDepth(9);
    this.on('destroy', () => { 
      this.healthBar.destroy();
      console.log("something died:" + this.constructor.name);
      switch(this.constructor.name) {
        case "Colonist": break;
        case "Soldier": break;
        case "Creep": 
          this.level.score.creep++;
          level.spawnWood(this.x,this.y,properties.woodOnDeath);
          break;
        case "Twig":
        console.log("yisss");
          this.level.score.invaders++;
          level.spawnWood(this.x,this.y,properties.woodOnDeath);
          break;
        case "Flower":
        console.log("yiss");
          this.level.score.bosses++;
          level.spawnWood(this.x,this.y,properties.woodOnDeath);
          break;
        default:
      }

    });
    this.updateHealthBar(true);
    this.once = true;
    this.properties = properties;
  }

  resizeAndSetOrgTarget() {
    this.orgTarget = this.target;
    this.setSize(this.properties.width, this.properties.height);
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
    this.setVelocity(0,0);
    this.target = new Object({x:256+512,y:360});

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
      this.setVelocityY(this.speed * signY);
    }

    if (!(this.body.touching.up) && signY<0) {
      this.setVelocityY(this.speed * signY);
    }
    if (!(this.body.touching.left) && signX<0) {
      this.setVelocityX(this.speed * signX);
    }
    if (!(this.body.touching.right) && signX>0) {
      this.setVelocityX(this.speed * signX);
    }
    this.mode = modeMoving;
    this.once = false;
  }

  stop() {
    if (this.alive) {
      this.setVelocity(0,0);
    }
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
    if (this.level.step%50==0) { //|| dist < this.attackRadius) {
      if(this.target.constructor.name==="Creep") {//} and solider /// attack=1 because soliders hate weeding
        this.target.health -= this.attackCreepStrength;
      }
      else {
        this.target.health -= this.attackStrength;
      }
      console.log(this.target.constructor.name);
      //this.mode = modeAttacking;
     // this.target.updateHealthBar();
      if (this.target.health < 1) {
         this.mode = modeMoving;
         let deadBuilding = this.target;
         this.target = null;
         deadBuilding.destroy();
         this.mode == modeMoving;
         this.target = this.orgTarget;
      }
    }
  }

  /**
   * Attack a building
   */
  attackBuilding(target) {
    if (target) {
      this.target = target;
    }
    if (this.level.step%50==0) {
      target.health -= this.attackStrength;
      this.mode = modeAttacking;
      if (this.target.health < 1) {
         this.mode = modeMoving;
         let deadBuilding = this.target;
         this.target = null;
         deadBuilding.destroy();
         this.mode == modeMoving;
         this.target = this.orgTarget;
      }
    }
  }

  update(step) {
    this.updateHealthBar();

    if (!this.target) {
      // It's valid for some (e.g. player-owned) units not to have a target.
      return;
    }

    const dist = distance(this.x, this.y, this.target.x, this.target.y);
    if (this.mode==modeAttacking || dist < this.attackRadius) {
      this.attackTarget();
    }
    else {
     // if (this.body.velocity.x < 0.1 && this.body.velocity.y < 0.1) {
        this.approachTarget();
    //  }
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
