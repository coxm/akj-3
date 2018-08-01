import {creepProperties} from '../settings';
import {Invader} from './Invader';


export class Creep extends Invader {
  constructor(level, x, y, frame, anim, target) {
    super(level, x, y, creepProperties);
    this.setFrame(frame);
    this.healthBar.setDepth(51);

  }
}
