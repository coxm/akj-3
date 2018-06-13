import {Scene, Timer} from 'phaser';


export class Title extends Scene {
  create() {
    // For example:
    // this.title = this.add.sprite(0.5 * this.sys.game.config.width, 80);
    // this.title.play('title');
    this.scene.bringToTop();
    const {width, height} = this.sys.game.config;
    this.add.text(0.5 * width, 0.3 * height, __TITLE__, {
      fontSize: '16px',
      fill: '#abcde0',
    }).setOrigin(0.5, 0.5);
    this.input.on('pointerdown', function() {
      this.scene.start('Level0');
    }, this);
  }
}
