import {Physics, Scene} from 'phaser';

import {
  tilesetName, ditchFrame, towerFrame, wallFrame, tileWidth, tileHeight,
  structureAssembleRate, gameHeight, gameWidth, woodRequiredForUnit,
  woodRequiredForStructure, woodGainedFromKilling, initialWood,
} from '../settings';
import {randElement, requireNamedValue, tilePositionOfPixels} from '../util';
import {
  Colonist, Ditch, Flower, Invader, Soldier, Tower, Twig, Wall, Building, Creep
} from '../sprites/index';
import {Score} from '../var/index';

import {barracksProperties, wallProperties, towerProperties,
  townHouseProperties, townHallProperties, farmProperties} from '../settings';

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


const pixelTopLeftOfTile = (x, y) => [x * tileWidth, y * tileHeight];


const isFriendly = sprite => (
  sprite instanceof Invader // Includes Flower and Twig.
);


/**
 * Place a structure on button click.
 *
 * @this {Phaser.GameObjects.Sprite} the button clicked.
 */
function placeStructureOnButtonClick(level) {
  level.enterPlacementMode(this.structureId);
}


export class Level extends Phaser.Scene {
  get wood() {
    return this.woodRemaining;
  }

  set wood(value) {
    this.woodRemaining = value;
    this.woodText.setText(`Wood: ${value}`);
  }

  playMainMusic() {
    this.mainMusic.play();
  }
  playMainMusicDramatic() {
    this.mainMusicDramatic.play();
  }

  create() {
    this.state = 1; // state is the current "wave"/event
    this.step = 9991; // step is just a counter incremented by update. states are triggered by step numbers
    this.gameover = false;
    this.mainMusic = this.sound.add('main-theme');
    this.mainMusicDramatic = this.sound.add('main-theme-dramatic');
    this.mainMusicDramatic.on('ended', (sound) => {
        this.playMainMusic();
    });

    this.mainMusic.on('ended', (sound) => {
        this.playMainMusicDramatic();
    });

    this.mainMusic.play();


    this.woodRemaining = initialWood;
    this.createTilemap();
    this.createActors();
    this.createInput();
    this.createUI();

    this.randomGen = new Phaser.Math.RandomDataGenerator(2);
  }

  createTilemap() {
    this.mapOffsetX = 271;
    this.mapOffsetY = 16;
    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 32,
      tileHeight: 32,
    });
    this.tileset = this.tilemap.addTilesetImage('tileset', tilesetName);
    this.tileLayers = ['ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, this.mapOffsetX, this.mapOffsetY);
      return dict;
    }, {});
  }

  createActors() {
    this.groups = {
      placement: this.add.group(),
      invaders: this.add.group(),
      creep: this.add.group(),
      assembling: this.add.group(),
      friendlies: this.add.group(),
      buildings: this.add.group(),
    };

    this.targetLayer = this.tilemap.objects.find(
      layer => layer.name === 'invaderTargets');
    this.invaderSpawns = this.loadSpawns('invaderSpawns', true);
    this.friendlySpawns = this.loadSpawns('friendlySpawns');
    this.placingObject = null; // {id: string; sprite: Sprite;}

    // TODO create building obj so they can have health bars

    const buildings = requireNamedValue(this.tilemap.objects, 'buildings');
    for (const b of buildings.objects) {
      console.log(b.type);
      let properties = null;
      switch(b.type) {
        case "Barracks": properties = barracksProperties; break;
        case "TownHall": properties = townHallProperties; break;
        case "FarmHouse": properties = farmProperties; break;
        case "PlainBuilding": properties = townHouseProperties; break;
      }
     /* 
      const sprite = this.physics.add.staticSprite(
        b.x + this.mapOffsetX + 2 * tileWidth,
        b.y + this.mapOffsetY - 2 * tileHeight,
        b.type);
        */
        const sprite = new Building(this, b.x + this.mapOffsetX + 2 * tileWidth,
        b.y + this.mapOffsetY - 2 * tileHeight,
        properties);
      sprite.isFriendly = true;
      sprite.building = b;
      sprite.isBuilding = true;
      this.physics.world.enable(sprite, Physics.Arcade.STATIC_BODY);
      if (b.type=="TownHall") {
        sprite.body.setOffset(0,32);
        sprite.body.setSize(190,128,false);
        this.townhall=sprite;
        this.townhall.on('destroy', this.endGame, this);
        
       }
      //sprite.body.immovable = true;
      this.groups.buildings.add(sprite, true);
    
    }
    //this.barracks = this.physics.add.sprite(0,0,"tileset");
     //this.physics.add.collider(this.groups.actors, this.buildings);
     this.physics.add.overlap(this.groups.invaders, this.groups.friendlies, this.attackFriendly, null, this);
     this.physics.add.overlap(this.groups.invaders, this.groups.buildings, this.attackBuilding, null, this);
     this.physics.add.overlap(this.groups.creep, this.groups.buildings, this.attackBuilding, null, this);
     this.physics.add.overlap(this.groups.creep, this.groups.friendlies, this.attackFriendly, null, this);
     this.physics.add.collider(this.groups.invaders, this.groups.invaders);
     this.physics.add.collider(this.groups.invaders, this.groups.creep);
     this.physics.add.collider(this.groups.friendlies, this.groups.buildings);
     this.physics.add.collider(this.groups.friendlies, this.groups.friendlies);
//   this.physics.add.collider(
  //    this.groups.actors,
    //  this.groups.actors,
      //this.onActorCollision
   // );
     //this.physics.add.overlap(this.groups.actors, this.groups.actors, this.onActorCollision, null, this);

  }

  createUI() {    
    this.input.mouse.disableContextMenu();

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
      // button.on('pointerover', function(event) { /* TODO */ }, this);
      // button.on('pointerout', function(event) { /* TODO */ }, this);
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
    this.scoreText.visible = false;
    this.woodText = this.add.text(40, 572, `Wood: ${this.woodRemaining}`, {
      fontSize: '32px',
      fill: '#111',
    });
    let wall_cost_img = this.add.image(50, 110, 'tileset');
    wall_cost_img.setFrame(69);
    let wall_cost_label = this.add.text(70, 98, '' + woodRequiredForStructure["wall"], { fontSize: '24px', fill: '#111' });
    let tower_cost_img = this.add.image(178, 110, 'tileset');
    tower_cost_img.setFrame(69);
    let tower_cost_label = this.add.text(198, 98, '' + woodRequiredForStructure["tower"], { fontSize: '24px', fill: '#111' });

    let soldier_cost_img = this.add.image(50, 302, 'tileset');
    soldier_cost_img.setFrame(69);
    let soldier_cost_label = this.add.text(70, 290, '' + woodRequiredForUnit["Soldier"], { fontSize: '24px', fill: '#111' });
    let farmer_cost_img = this.add.image(178, 302, 'tileset');
    farmer_cost_img.setFrame(69);
    let farmer_cost_label = this.add.text(198, 290, '' + woodRequiredForUnit["Colonist"], { fontSize: '24px', fill: '#111' });

    this.towerPlacementPointer = this.add.sprite(-128, -108, 'tower');
    placementModeInfo.tower.sprite = this.towerPlacementPointer;
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

  cancelAllModes() {
    this.cancelUnitOrderMode();
    this.cancelObjectPlacementMode();
  }

  onUnitSelect(event, unit) {
    console.log('event', window.event = event);
    if (event.leftButtonDown()) {
      this.enterUnitOrderMode(unit, event);
    }
    else if (this.orderingUnit) {
      this.completeUnitOrder(event.pointer.x, event.pointer.y);
    }
  }

  onUnitOrderClick(event) {
    if (event.leftButtonDown()) {
      this.cancelUnitOrderMode();
    }
    else {
      __DEV__ && console.assert(
        this.orderingUnit, "Can't order unit: no unit selected!");
      this.orderingUnit.approachTarget({x: event.worldX, y: event.worldY});
      event.event.preventDefault();
    }
  }

  enterUnitOrderMode(unit, event) {
    this.cancelAllModes();
    this.orderingUnit = unit;
    unit.debug = true;
    // TODO: set cursor?
    __DEV__ && console.log('Entering unit order mode');
    this.input.on('pointerdown', this.onUnitOrderClick, this);
  }

  cancelUnitOrderMode() {
    __DEV__ && console.log('Exit order mode');
    if (this.orderingUnit) {
      this.orderingUnit.debug = false;
      this.orderingUnit = null;
      this.input.off('pointerdown', this.onUnitOrderClick, this);
    }
  }

  enterPlacementMode(id) {
    this.cancelAllModes();

    const woodRequired = woodRequiredForStructure[id];
    if (this.wood < woodRequired) {
      // TODO: add text object explaining.
      console.log('Insufficient wood for', id);
      return;
    }

    const pointer = this.input.mousePointer;
    const details = placementModeInfo[id];
    if (!details.sprite) {
      details.sprite = this.add.sprite(
        pointer.x, pointer.y, tilesetName, details.frame);
      details.sprite.alpha = 0.5;
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
    //const sprite = createSprite(this, x, y)
    let properties = null;
    if (this.placingObject.id === "wall") {
      properties = wallProperties;
    }
    else if(this.placingObject.id === "tower") {
      properties = towerProperties;
    }
    const sprite = new Building(this, x, y, properties);

    this.groups.assembling.add(sprite, true);
    sprite.alpha = 0;
    sprite.health = 0;
    this.wood -= woodRequiredForStructure[this.placingObject.id];
    this.cancelObjectPlacementMode();
  }

  cancelObjectPlacementMode() {
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

    for (const actor of this.groups.invaders.children.entries) {
      actor.update(this.step);
    }
    for (const actor of this.groups.friendlies.children.entries) {
      actor.update(this.step);
    }
    for (const actor of this.groups.buildings.children.entries) {
      actor.update(this.step);
    }
    for (const actor of this.groups.creep.children.entries) {
      actor.update(this.step);
    }

    this.checkStateAndTriggerEvents();
   // const actors = this.groups.actors.children.entries;
    //const len = actors.length;
   //// for (let i = 0; i < len; ++i) {
    //  for (let j = i + 1; j < len; ++j) {
//          this.onActorCollision, // Collision callback.
  //  //      () => true, // Process callback. 
        //  this // Callback context.
    //    );
    ////  //}
    //}

    // For each structure being assembled, increment its health. If the
    // structure has reached full health, create a proper actor for it in that
    // place.
    for (const struct of this.groups.assembling.children.entries) {
      struct.health += structureAssembleRate;
      if (struct.health >= struct.maxHealth) {
        struct.health = struct.maxHealth;
        struct.alpha = 1;
        this.groups.assembling.remove(struct);
        this.physics.world.enable(struct, Physics.Arcade.STATIC_BODY);
        this.groups.buildings.add(struct);
      }
      else {
        struct.alpha = struct.health / struct.maxHealth;
      }
    }
  }

  onActorCollision(actorA, actorB) {
    //console.log(actorB);
    //({x:0, y:0});
    //if (actorA.building != true) {
      actorA.body.velocity.x = 0;
      actorA.body.velocity.y = 0;
   // }
    //if (actorB.building != true) {
      actorB.body.velocity.x = 0;
      actorB.body.velocity.y = 0;
      //console.log("immovable");
    // actorA.body.immovable = true;
     // actorB.body.immovable = true;
    
    // dont collide with self
    if (actorA.constructor === actorB.constructor) {
      // not ever being triggered
      console.log("dont collide with self");
      return;
    }

    if (actorA.isFriendly === actorB.isFriendly) {
      // Actors don't attack others on their own side.
      return;
    }

    if (!actorA.isFriendly){ 
    //  [actorA, actorB] = [actorB, actorA];
    }
    // Now actorA is the AI.

    // Weed and Invader instances can attack all units.
    if (actorB.isBuilding) {
      actorA.attackBuilding(actorB);
    }
    else {
      //actorA.stop();
      //actorB.stop();
      //actorA.attackTarget && actorA.attackTarget(actorB);
    }
  }

  attackBuilding(invader, building) {
    invader.stop();
    invader.attackBuilding(building);
  }
  attackFriendly(invader, friendly) {
    invader.stop();
    invader.attackBuilding(friendly);
    friendly.stop();
    friendly.attackBuilding(invader);
  }
  checkStateAndTriggerEvents() {
    if (this.step % 102 == 0) {
      this.state++;

      for (let i=0; i<1; i++) {
        this.spawnAttacker();
        if(true){
          let x = 511-320+64+16 + this.randomGen.between(0,30)*32;//this.randomGen.pick([0,1024])+256;
          let y = 368+16+352;//this.randomGen.pick([0,720]);
          let creep = new Creep(this, x, y, null);
          this.addSpriteAndCreateBody(creep, this.groups.creep);
          //player.setVelocity(-60,-60);
          let angle = this.randomGen.angle();
          let speed = 5;
          //player.setVelocityX(speed * Math.cos(angle));
          //player.setVelocityY(speed * Math.sin(angle));
          creep.setFrame(60);
          //this.groups.creep.add(player, true);
        }
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
    for (const sprite of this.groups.friendlies.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }
    for (const sprite of this.groups.invaders.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }
    for (const sprite of this.groups.creep.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }
    for (const sprite of this.groups.buildings.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX === tileX && spriteTileY === tileY) {
        return sprite;
      }
    }

    return null;
  }

  addSpriteAndCreateBody(sprite, group, bodyType = Physics.Arcade.DYNAMIC_BODY) {
    this.physics.world.enable(sprite, bodyType);
    group.add(sprite, true);
    sprite.resize();
    //this.physics.add.existing(sprite);
    //sprite.setActive(); // oooh
  }

  spawnAttacker(
    spawn = randElement(this.invaderSpawns), attackerClass = Math.random() > 0.8 ? Flower : Twig) {
    const invader = new attackerClass(this, spawn.x, spawn.y, spawn.target);
    this.addSpriteAndCreateBody(invader, this.groups.invaders);
    invader.approachTarget(spawn.target);

    return invader;
  }

  spawnSoldier() {
    return this.spawnFriendly(Soldier, 'SoldierSpawn');
  }

  spawnColonist() {
    return this.spawnFriendly(Colonist, 'ColonistSpawn');
  }

  spawnFriendly(cls, spawnName) {
    const woodRequired = woodRequiredForUnit[cls.name];
    if (this.wood < woodRequired) {
      // TODO: add text object explaining.
      console.log('Insufficient wood for', cls.name);
      return false;
    }
    this.wood -= woodRequired;
    const spawn = requireNamedValue(this.friendlySpawns, spawnName);
    const sprite = new cls(this, spawn.x, spawn.y);
    this.addSpriteAndCreateBody(sprite, this.groups.friendlies);
    sprite.setInteractive().on(
      'pointerdown', event => this.onUnitSelect(event, sprite));
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

  endGame() { 
    if (this.gameover) { 
      return;
    }
    this.gameover = true;
    let graphics = this.add.graphics();
    graphics.fillRect(0, 0, gameWidth, gameHeight);
    graphics.setAlpha(0);
    var tween = this.tweens.add({
        targets: graphics,
        props: {
            alpha: 0.7
        },
        duration: 3000,
        yoyo: false,
        repeat: 0
    });
    let gameoverScreen = this.add.graphics();
    gameoverScreen.fillStyle(0x999999, 1);
    gameoverScreen.fillRect(300, 150, gameWidth-600, gameHeight-300);
    let gameoverText = this.add.text(550, 180, 'Game over', { fontSize: '32px', fill: '#000' });
    let summaryText = this.add.text(360, 230, 'The village has fallen to the Growth!\n\nYour score was: ' 
      + this.score.getScore() + "\n\nYou killed:\n * " + this.score.invaders + " twig monsters\n * " + this.score.bosses 
      + " flower monsters\n * " + this.score.creeps + " growth creeps\n\nYou also harvested " + this.score.wood
      + " pieces of wood,\nand you recruited:\n * " + this.score.farmers + " farmers\n * " + this.score.soldiers + " soldiers", 
      { fontSize: '24px', fill: '#111' });

  }  
}
