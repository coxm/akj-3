import {flowerProperties, flowerFrame} from '../settings';
import {Invader} from './Invader';


export class Flower extends Invader {
  constructor(level, x, y, target) {
    super(level, x, y, flowerFrame, Object.assign({target}, flowerProperties));
  }
}
