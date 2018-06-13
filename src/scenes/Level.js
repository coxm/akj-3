import {Scene} from 'phaser';


export class Level extends Phaser.Scene {
  create() {
    const {width, height} = this.sys.game.config;
    this.add.text(0.5 * width, 0.3 * height, 'Level 0', {
      fontSize: '16px',
      fill: '#abcde0',
    }).setOrigin(0.5, 0.5);
  }

  update(time, delta) {
  }
}
