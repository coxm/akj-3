import {Scene, Timer} from 'phaser';


export class Title extends Scene {
  create() {
    // For example:
    // this.title = this.add.sprite(0.5 * this.sys.game.config.width, 80);
    // this.title.play('title');

    this.scene.bringToTop();
    const {width, height} = this.sys.game.config;
    const title = this.add.image(0.5 * width, 0.4 * height, 'title');
    title.setScale(2);
    let gameText = this.add.text(80, 620, 'A game made by @James_Deans_Jeans, @gsamaro, @Kyle3wynn, @toasty and @dollarone' +
    '\n                             for the 3rd Alakajam!', { fontSize: '24px', fill: '#777' });
    let titleText = this.add.text(420, 700, 'Click anywhere to start', { fontSize: '32px', fill: '#777' });
    this.introMusic = this.sound.add('intro-theme');
    this.introMusic.play();

    titleText.alpha = 0;
      var tween = this.tweens.add({
        targets: titleText,
        props: {
            alpha: 1
        },
        duration: 3000,
        yoyo: true,
        repeat: -1
    });

    this.input.on('pointerdown', function() {
      this.scene.start('Level0');
    }, this);
  }
}
