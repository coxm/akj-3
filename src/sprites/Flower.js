import {flowerProperties} from '../settings';
import {Invader} from './Invader';


export class Flower extends Invader {
  constructor(level, x, y, target) {
    super(level, x, y, Object.assign({target}, flowerProperties));
//	this.setOffset(0,24);
//	this.body.setSize(,128,false);
  }
}
