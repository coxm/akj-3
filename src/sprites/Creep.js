import {creepProperties} from '../settings';
import {Invader} from './Invader';


export class Creep extends Invader {
  constructor(level, x, y, target) {
    super(level, x, y, creepProperties);
  }
}
