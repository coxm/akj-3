import {Game} from 'phaser';

import './css/index.css';

import {Boot} from './scenes/Boot';
import {Title} from './scenes/Title';
import {Level} from './scenes/Level';


const boot = new Boot({key: 'Boot'});
const title = new Title({key: 'Title'});
const levels = __LEVELS__.map(key => new Level({key}));


const game = new Game({
  parent: 'root',
  pixelArt: true,
  roundPixels: true,
  width: 600,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 800},
      debug: __DEV__,
    },
  },
  scene: [
    boot,
    title,
    ...levels,
  ],
});


// For development convenience.
__DEV__ && Object.assign(window, {
  game,
  boot,
  title,
  levels,
});
