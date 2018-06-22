import {Scene} from 'phaser';


export class Level extends Phaser.Scene {
  create() {
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
