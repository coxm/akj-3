import {GameObjects} from 'phaser';

import {colonistProperties} from '../settings';
import {AnyAttacker} from './AnyAttacker';


export class Colonist extends AnyAttacker {
  constructor(level, x, y, properties) {
    super(level, x, y, colonistProperties);
  }
}
