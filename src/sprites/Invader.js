import {GameObjects} from 'phaser';

import {AnyAttacker} from './AnyAttacker';


export class Invader extends AnyAttacker {
  constructor(level, x, y, properties) {
    super(level, x, y, properties);
  }
}
