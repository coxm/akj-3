import {Scene} from 'phaser';


export class Level extends Phaser.Scene {
  create() {
    let ui_img = this.add.image(128, 768, 'ui-img');
//    ui_img.displayHeight = 768;

    this.startBtn = this.add.sprite(64, 96, 'ui').setInteractive();
    this.startBtn.setFrame(2);
    this.startBtn.orgFrame = 2;

    this.startBtn.on('pointerover', function (event) { /* Do something when the mouse enters */ });
    this.startBtn.on('pointerout', function (event) { /* Do something when the mouse exits. */ });
    this.startBtn.on('pointerdown', function(event) { this.startGame(true); }, this); // Start game on click.
    this.startBtn.on('pointerup', function(event) { this.startGame(false); } , this); // Start game on click.
    this.offsetX = 256;
    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 16,
      tileHeight: 16,
    });
    this.tileset = this.tilemap.addTilesetImage('apoc16x16', 'apoc16x16-img');
    this.tileLayers = ['ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, this.offsetX, 0);
      return dict;
    }, {});
  }

  startGame(down) {
    if(down) {
      this.startBtn.setFrame(this.startBtn.orgFrame+24);
    } 
    else {
      this.startBtn.setFrame(this.startBtn.orgFrame);
    }
  }

  update(time, delta) {
  }
}
