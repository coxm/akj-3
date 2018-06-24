import {Game, WEBGL} from 'phaser';

import './css/index.css';

import {Boot} from './scenes/Boot';
import {Title} from './scenes/Title';
import {Level} from './scenes/Level';
import {gameWidth, gameHeight} from './settings';


const boot = new Boot({key: 'Boot'});
const title = new Title({key: 'Title'});
const levels = __LEVELS__.map(key => new Level({key}));


const game = new Game({
  parent: 'root',
  pixelArt: true,
  zoom: 1,
  roundPixels: true,
  width: gameWidth,
  height: gameHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {x: 0, y: 0},
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
  level: levels[0],
  __BUILD__: __BUILD__,
});
