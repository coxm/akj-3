import {GameObjects} from 'phaser';

import {tilesetName, soldierFrame} from '../settings';


/**
 * @type {Target}
 * @param {number} x - the x-position (or getter) of this target.
 * @param {number} y - the y-position (or getter) of this target.
 */


export class Soldier extends GameObjects.Sprite {
  constructor(level, x, y) {
    super(level, x, y, tilesetName, soldierFrame);
  }

  /**
   * Approach a target.
   *
   * @param {Target} target - the target.
   */
  approachTarget(target) {
  }
}
