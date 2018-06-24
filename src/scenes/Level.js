import {Physics, Scene} from 'phaser';

import {
  tilesetName, ditchFrame, towerFrame, wallFrame, tileWidth, tileHeight,
} from '../settings';
import {randElement, requireNamedValue} from '../util';
import {
  Colonist, Ditch, Invader, Soldier, Tower, Wall,
} from '../sprites/index';
import {Score} from '../var/index';


const placementModeInfo = {
  ditch: {
    sprite: null,
    frame: ditchFrame,
    create(level, x, y) {
      return new Ditch(level, x, y);
    },
  },
  wall: {
    sprite: null,
    frame: wallFrame,
    create(level, x, y) {
      return new Wall(level, x, y);
    },
  },
  tower: {
    sprite: null,
    frame: towerFrame,
    create(level, x, y) {
      return new Tower(level, x, y);
    },
  },
};


const tilePositionOfPixels = (x, y) => [
  Math.floor(x / tileWidth + 0.5),
  Math.floor(y / tileHeight + 0.5)
];


const pixelTopLeftOfTile = (x, y) => [x * tileWidth, y * tileHeight];


/**
 * Place a structure on button click.
 *
 * @this {Phaser.GameObjects.Sprite} the button clicked.
 */
function placeStructureOnButtonClick(level) {
  level.enterPlacementMode(this.structureId);
}


export class Level extends Phaser.Scene {
  create() {
    this.state = 1; // state is the current "wave"/event
    this.step = 1; // step is just a counter incremented by update. states are triggered by step numbers

    this.createUI();
    this.createTilemap();
    this.createActors();
    this.createInput();
  }

  createTilemap() {
    this.mapOffsetX = 264;
    this.mapOffsetY = 8;
    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 16,
      tileHeight: 16,
    });
    this.tileset = this.tilemap.addTilesetImage('apoc16x16', tilesetName);
    this.tileLayers = ['ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, this.mapOffsetX, this.mapOffsetY);
      return dict;
    }, {});
  }

  createActors() {
    this.groups = {
      placement: this.add.group(),
      actors: this.add.group(),
    };

    this.targetLayer = this.tilemap.objects.find(
      layer => layer.name === 'invaderTargets');
    this.invaderSpawns = this.loadSpawns('invaderSpawns', true);
    this.friendlySpawns = this.loadSpawns('friendlySpawns');
    this.placingObject = null; // {id: string; sprite: Sprite;}
  }

  createUI() {    
    let ui_img = this.add.image(128, 768, 'ui-img');
//    ui_img.displayHeight = 768;

    this.buttons = {
      wall: this.add.sprite(64, 96, 'ui').setInteractive().setFrame(2),
      tower: this.add.sprite(192, 96, 'ui').setInteractive().setFrame(3),
      soldier: this.add.sprite(64, 288, 'ui').setInteractive().setFrame(8),
      colonist: this.add.sprite(192, 288, 'ui').setInteractive().setFrame(9),
      upgrade_wall: this.add.sprite(64, 480, 'ui').setInteractive().setFrame(14),
      upgrade_tower: this.add.sprite(192, 480, 'ui').setInteractive().setFrame(15),

    };
    for (const key in this.buttons) {
      const button = this.buttons[key];
      button.orgFrame = button.frame.name;
      button.on('pointerover', function(event) { /* TODO */ }, this);
      button.on('pointerout', function(event) { /* TODO */ }, this);
      button.on('pointerdown', function(event) {
        this.setButtonDownState(button, true);
      }, this);
      button.on('pointerup', function(event) {
        this.setButtonDownState(button, false);
      }, this);
    }

    for (const structureId of ['wall', 'tower']) {
      const button = this.buttons[structureId];
      button.on('pointerdown', function() {
        this.enterPlacementMode(structureId);
      }, this);
    }    
    this.buttons.soldier.on('pointerdown', () => { this.spawnSoldier(); });
    this.buttons.colonist.on('pointerdown', () => { this.spawnColonist(); });
    
    this.score = new Score();
    this.scoreText = this.add.text(716, 16, 'Score: 0', { fontSize: '32px', fill: '#777' });
  }

  createInput() {
    const keymap = {
      'W': 'wall',
      'T': 'tower',
      'D': 'ditch',
    };
    for (const key in keymap) {
      this.input.keyboard.on(
        `keydown_${key}`, () => this.enterPlacementMode(keymap[key]));
    }
  }

  enterPlacementMode(id) {
    this.resetObjectPlacement();
    const pointer = this.input.mousePointer;
    const details = placementModeInfo[id];
    if (!details.sprite) {
      details.sprite = this.add.sprite(
        pointer.x, pointer.y, tilesetName, details.frame);
      this.groups.placement.add(details.sprite);
    }
    const sprite = details.sprite;
    sprite.visible = true;
    sprite.active = true;
    this.placingObject = {id, sprite};
    this.input.on('pointerdown', this.attemptObjectPlacement, this);
  }

  attemptObjectPlacement() {
    if (this.input.mousePointer.x <= 264) { 
      return; 
    }
    const [tileX, tileY] = tilePositionOfPixels(
      this.input.mousePointer.x, this.input.mousePointer.y);

    if (this.getObjectInTile(tileX, tileY)) {
      __DEV__ && console.log('Something already occupies that tile!');
      // TODO: play a sound effect or something?
      return;
    }

    this.input.off('pointerdown', this.attemptObjectPlacement, this);
    const createSprite = placementModeInfo[this.placingObject.id].create;
    const [x, y] = pixelTopLeftOfTile(tileX, tileY);
    const sprite = createSprite(this, x, y);
    this.groups.actors.add(sprite, true);
    this.physics.add.existing(sprite);
    this.resetObjectPlacement();
  }

  resetObjectPlacement() {
    if (this.placingObject) {
      this.placingObject.sprite.active = false;
      this.placingObject.sprite.visible = false;
      this.placingObject = null;
    }
  }

  setButtonDownState(button, down) {
    if(down) {
      button.setFrame(button.orgFrame+24);
    } 
    else {
      button.setFrame(button.orgFrame);
    }
  }

  update(time, delta) {
    this.step++;
    // Update the 'place object' sprite to the current mouse position.
    if (this.placingObject) {
      const {x, y} = this.input.mousePointer;
      this.placingObject.sprite.setPosition(x, y);
    }

    for (const actor of this.groups.actors.children.entries) {
      actor.update(time, delta);
    }

    this.checkStateAndTriggerEvents();
    const actors = this.groups.actors.children.entries;
    const len = actors.length;
    for (let i = 0; i < len; ++i) {
      for (let j = i + 1; j < len; ++j) {
        this.physics.world.collide(
          actors[i], actors[j], this.onActorCollision, undefined, this);
      }
    }
  }

  onActorCollision(actorA, actorB) {
    if (actorA.constructor === actorB.constructor) {
      return;
    }
    console.log('collision', actorA.constructor.name, actorB.constructor.name);
  }

  checkStateAndTriggerEvents() {
    if (this.step % 1000 == 0) {
      this.state++;
      for (let i=0; i<this.state; i++) {
        this.spawnAttacker();
        this.scoreText.setText("Score: " + this.score.getScore() + "\nState: " + this.state);
      }
    }
    else {
      return false;
    }
  }

  /**
   * Get the sprite in a tile position, or null if the tile is empty.
   *
   * @returns {Phaser.GameObjects.Sprite | null}
   */
  getObjectInTile(tileX, tileY) {
    for (const sprite of this.groups.actors.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }
    return null;
  }

  spawnAttacker(spawn = randElement(this.invaderSpawns)) {
    const invader = new Invader(this, spawn.x, spawn.y);
    this.groups.actors.add(invader, true);
    this.physics.add.existing(invader);
    this.physics.world.enable(invader, Physics.Arcade.DYNAMIC_BODY);
    invader.target = spawn.target;
    return invader;
  }

  spawnSoldier() {
    return this.spawnFriendly(Soldier, 'SoldierSpawn');
  }

  spawnColonist() {
    return this.spawnFriendly(Colonist, 'ColonistSpawn');
  }

  spawnFriendly(cls, spawnName) {
    const spawn = requireNamedValue(this.friendlySpawns, spawnName);
    const sprite = new cls(this, spawn.x, spawn.y);
    this.groups.actors.add(sprite, true);
    this.physics.add.existing(sprite);
    this.physics.world.enable(sprite, Physics.Arcade.DYNAMIC_BODY);
    return sprite;
  }

  makePointObject(obj) {
    return Object.assign({}, obj, {
      x: Math.floor(obj.x) + this.mapOffsetX,
      y: Math.floor(obj.y) + this.mapOffsetY,
    });
  }

  findTarget(obj) {
    const prop = requireNamedValue(obj.properties, 'target');
    return requireNamedValue(this.targetLayer.objects, prop.value);
  }

  loadSpawns(tileLayerName, targetting) {
    let objects = this.tilemap.objects
      .find(layer => layer.name === tileLayerName)
      .objects;
    if (targetting) {
      objects = objects.map(obj => Object.assign(this.makePointObject(obj), {
        target: this.makePointObject(this.findTarget(obj)),
      }));
    }
    else {
      objects = objects.map(obj => this.makePointObject(obj));
    }
    return objects;
  }
}
