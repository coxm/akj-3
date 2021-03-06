import {GameObjects} from 'phaser';

import {soldierProperties} from '../settings';
import {AnyAttacker} from './AnyAttacker';


export class Soldier extends AnyAttacker {
  constructor(level, x, y, properties) {
    super(level, x, y, soldierProperties);
  }
}
