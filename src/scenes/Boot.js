import {Scene} from 'phaser';


export class Boot extends Scene {
  preload() {
    // Load images here. Prefer to import JSON and other text assets into the
    // bundle.
    // this.load.on('complete', this.onLoadComplete, this);
    this.onLoadComplete();
  }

  onLoadComplete() {
    console.log('Loaded');
    this.scene.start('Title');
  }
}
