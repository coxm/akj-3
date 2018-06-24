import {GameObjects} from 'phaser';

import {AnyAttacker} from './AnyAttacker';


export class Invader extends AnyAttacker {
  constructor(level, x, y, frameIndex, properties) {
    super(level, x, y, frameIndex, properties);
  }
}
