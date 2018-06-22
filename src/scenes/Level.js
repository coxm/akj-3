import {Scene} from 'phaser';


export class Level extends Phaser.Scene {
  create() {
    const {width, height} = this.sys.game.config;
    this.add.text(0.5 * width, 0.3 * height, 'Level 0', {
      fontSize: '16px',
      fill: '#abcde0',
    }).setOrigin(0.5, 0.5);

    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 16,
      tileHeight: 16,
    });
    this.tileset = this.tilemap.addTilesetImage('apoc16x16', 'apoc16x16-img');
    this.tileLayers = ['ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, 0, 0);
      return dict;
    }, {});
  }

  update(time, delta) {
  }
}
