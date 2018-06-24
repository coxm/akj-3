import {twigProperties, twigFrame} from '../settings';
import {Invader} from './Invader';


export class Twig extends Invader {
  constructor(level, x, y, target) {
    super(level, x, y, twigFrame, Object.assign({target}, twigProperties));
  }
}
