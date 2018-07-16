import {Physics, Scene} from 'phaser';

import {
  tilesetName, ditchFrame, towerFrame, wallFrame, tileWidth, tileHeight,
  structureAssembleRate, gameHeight, gameWidth, woodRequiredForUnit,
  woodRequiredForStructure, initialWood,
} from '../settings';
import {randElement, requireNamedValue, tilePositionOfPixels} from '../util';
import {
  Colonist, Ditch, Flower, Invader, Soldier, Tower, Twig, Wall, Building, Creep
} from '../sprites/index';
import {Score} from '../var/index';

import {barracksProperties, wallProperties, towerProperties,
  wallHouseProperties, towerHouseProperties, townHallProperties, farmProperties} from '../settings';

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
    this.step = 1; // step is just a counter incremented by update. states are triggered by step numbers
    this.gameover = false;
    this.mainMusic = this.sound.add('main-theme');
    this.mainMusicDramatic = this.sound.add('main-theme-dramatic');
    this.mainMusicDramatic.on('ended', (sound) => {
        this.playMainMusic();
    });

    this.mainMusic.on('ended', (sound) => {
        this.playMainMusicDramatic();
    });

    //this.mainMusic.play();

    this.gameStarted = false;
    this.woodRemaining = initialWood;
    this.createTilemap();
    this.createActors();
    this.createInput();
    this.createUI();
    this.introScreen();

    this.hasBarrack = true;
    this.hasFarm = true;
    this.hasTowerHouse = true;
    this.hasWallHouse = true;

    this.randomGen = new Phaser.Math.RandomDataGenerator(2);

  }

  createTilemap() {
    this.mapOffsetX = 271-32;
    this.mapOffsetY = 16-32;
    this.tilemap = this.make.tilemap({
      key: `tilemap:${this.sys.config.key}`,
      tileWidth: 32,
      tileHeight: 32,
    });
    this.tileset = this.tilemap.addTilesetImage('tileset', tilesetName);
    this.tileLayers = ['river','ground', 'rear', 'fore'].reduce((dict, name) => {
      dict[name] = this.tilemap.createStaticLayer(name, this.tileset, this.mapOffsetX, this.mapOffsetY);
      return dict;
    }, {});

    this.tileLayers['river'].setCollisionByExclusion([-1]);
  }

  createActors() {
    this.groups = {
      placement: this.add.group(),
      assembling: this.add.group(),
      creep: this.add.group(),
      invaders: this.add.group(),
      friendlies: this.add.group(),
      buildings: this.add.group(),
    };

    this.targetLayer = this.tilemap.objects.find(
      layer => layer.name === 'invaderTargets');
    this.invaderSpawns = this.loadSpawns('invaderSpawns', true);
    this.friendlySpawns = this.loadSpawns('friendlySpawns');
    this.placingObject = null; // {id: string; sprite: Sprite;}


    // TODO: add to physics, then hide
 //     r.visible = false;
//
  //  }

    const buildings = requireNamedValue(this.tilemap.objects, 'buildings');
    for (const b of buildings.objects) {
      console.log(b.type);
      let properties = null;
      switch(b.type) {
        case "Barracks": properties = barracksProperties; break;
        case "FarmHouse": properties = farmProperties; break;
        case "TowerHouse": properties = towerHouseProperties; break;
        case "WallHouse": properties = wallHouseProperties; break;
        case "TownHall": properties = townHallProperties; break;
      }
     /* 
      const sprite = this.physics.add.staticSprite(
        b.x + this.mapOffsetX + 2 * tileWidth,
        b.y + this.mapOffsetY - 2 * tileHeight,
        b.type);
        */
        const sprite = new Building(this, b.x + this.mapOffsetX + 16 + (2 * tileWidth),
        b.y + this.mapOffsetY - (2 * tileHeight),
        properties);
      sprite.isFriendly = true;
      sprite.building = b;
      sprite.isBuilding = true;
      this.physics.world.enable(sprite, Physics.Arcade.STATIC_BODY);
      //sprite.immovable = true;
      sprite.body.immovable = true;
      sprite.setImmovable(true);

      // the old double switcharoo
      switch(b.type) {
        case "Barracks":
          sprite.on('destroy', function() { this.hasBarrack=false; }, this);        
          break;
        case "FarmHouse":
          sprite.on('destroy', function() { this.hasFarm=false; }, this);        
          break;
        case "TowerHouse": 
          sprite.on('destroy', function() { this.hasTowerHouse=false; }, this);        
          break;
        case "WallHouse":
          sprite.on('destroy', function() { this.hasWallHouse=false; }, this);        
          break;
        case "TownHall":
        sprite.body.setOffset(0,32);
        sprite.body.setSize(190,128,false);
        this.townhall=sprite;
        this.townhall.on('destroy', this.endGame, this);
        let townHallTop1 = this.add.sprite(b.x + this.mapOffsetX + 2 * tileWidth,
        b.y + this.mapOffsetY - 2 * tileHeight-64, 'tileset');
        townHallTop1.setFrame(110);
        townHallTop1.setDepth(98);
        let townHallTop2 = this.add.sprite(b.x + 32 + this.mapOffsetX + 2 * tileWidth,
        b.y + this.mapOffsetY - 2 * tileHeight-64, 'tileset');
        townHallTop2.setFrame(111);
        townHallTop2.setDepth(98);
        
       }
      //sprite.body.immovable = true;
      this.groups.buildings.add(sprite, true);


    
    }
        // re-use spawning algo to populate the starting creep
      for(let i=0; i<289; i++) { 
        this.spawnCreep(true);
      }
      let toBeDestroyed = [];
      this.groups.creep.children.iterate(function (actor) {
        if(actor.frame.name===60) {
         toBeDestroyed.push(actor);
        }
      });
      let i = toBeDestroyed.length - 1;
      while(i > -1) {
          let getitem = toBeDestroyed[i];
          getitem.destroy();
          i--;
      }

    //this.barracks = this.physics.add.sprite(0,0,"tileset");
     //this.physics.add.collider(this.groups.actors, this.buildings);
     this.physics.add.collider(this.groups.invaders, this.groups.friendlies, this.attackFriendly, null, this);
     this.physics.add.collider(this.groups.invaders, this.groups.buildings, this.attackBuilding, null, this);
     this.physics.add.collider(this.groups.creep, this.groups.buildings, this.attackBuilding, null, this);
     this.physics.add.collider(this.groups.creep, this.groups.friendlies, this.attackFriendly, null, this);
     this.physics.add.collider(this.groups.invaders, this.groups.invaders);
    //this.physics.add.collider(this.groups.invaders, this.groups.creep); // nah just walk over
     this.physics.add.collider(this.groups.friendlies, this.groups.buildings);
     this.physics.add.collider(this.groups.friendlies, this.groups.friendlies);

     this.physics.add.collider(this.groups.creep, this.tileLayers['river']);
     this.physics.add.collider(this.groups.invaders, this.tileLayers['river']);
     this.physics.add.collider(this.groups.friendlies, this.tileLayers['river']);
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
    ui_img.setDepth(11);
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
      button.setDepth(12);
    }

    for (const structureId of ['wall', 'tower']) {
      const button = this.buttons[structureId];
      button.setDepth(12);
      button.on('pointerdown', function() {
        this.enterPlacementMode(structureId);
      }, this);
    }    
    this.buttons.soldier.on('pointerdown', () => { 
      this.cancelAllModes();
      this.spawnSoldier(); 
    });
    this.buttons.colonist.on('pointerdown', () => { 
      this.cancelAllModes();
      this.spawnColonist(); 
    });
    
    this.score = new Score();
    this.scoreText = this.add.text(716, 16, 'Score: 0', { fontSize: '32px', fill: '#777' });
    this.scoreText.setDepth(12);
    this.scoreText.visible = false;
    this.woodText = this.add.text(40, 572, `Wood: ${this.woodRemaining}`, {
      fontSize: '32px',
      fill: '#111',
    });
    this.woodText.setDepth(12);
    let wall_cost_img = this.add.image(50, 110, 'tileset');
    wall_cost_img.setFrame(69);
    wall_cost_img.setDepth(12);
    let wall_cost_label = this.add.text(70, 98, '' + woodRequiredForStructure["wall"], { fontSize: '24px', fill: '#111' });
    wall_cost_label.setDepth(12);
    let tower_cost_img = this.add.image(178, 110, 'tileset');
    tower_cost_img.setFrame(69);
    tower_cost_img.setDepth(12);
    let tower_cost_label = this.add.text(198, 98, '' + woodRequiredForStructure["tower"], { fontSize: '24px', fill: '#111' });
    tower_cost_label.setDepth(12);

    let soldier_cost_img = this.add.image(50, 302, 'tileset');
    soldier_cost_img.setFrame(69);
    soldier_cost_img.setDepth(12);
    let soldier_cost_label = this.add.text(70, 290, '' + woodRequiredForUnit["Soldier"], { fontSize: '24px', fill: '#111' });
    soldier_cost_label.setDepth(12);
    let farmer_cost_img = this.add.image(178, 302, 'tileset');
    farmer_cost_img.setFrame(69);
    farmer_cost_img.setDepth(12);
    let farmer_cost_label = this.add.text(198, 290, '' + woodRequiredForUnit["Colonist"], { fontSize: '24px', fill: '#111' });
    farmer_cost_label.setDepth(12);

    this.towerPlacementPointer = this.add.sprite(-128, -108, 'tower');
    placementModeInfo.tower.sprite = this.towerPlacementPointer;
    placementModeInfo.tower.sprite.setDepth(12);


    let blackOverlayTop = this.add.graphics();
    blackOverlayTop.fillStyle(0x000000, 1);
    blackOverlayTop.fillRect(256, 0, gameWidth-200, 16);
    blackOverlayTop.setDepth(50);
    let blackOverlayBot = this.add.graphics();
    blackOverlayBot.fillStyle(0x000000, 1);
    blackOverlayBot.fillRect(256, gameHeight-16, gameWidth, 16);
    blackOverlayBot.setDepth(50);
    let blackOverlayRight = this.add.graphics();
    blackOverlayRight.fillStyle(0x000000, 1);
    blackOverlayRight.fillRect(gameWidth-17, 0, 17, gameHeight);
    blackOverlayRight.setDepth(50);
    let blackOverlayLeft = this.add.graphics();
    blackOverlayLeft.fillStyle(0x000000, 1);
    blackOverlayLeft.fillRect(256, 0, 16, gameHeight);
    blackOverlayLeft.setDepth(50);
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

    const pointer = this.input.mousePointer;
    const details = placementModeInfo[id];
    if (!details.sprite) {
      details.sprite = this.add.sprite(
        pointer.x, pointer.y, tilesetName, details.frame);
      details.sprite.alpha = 0.5;
      details.sprite.setDepth(12);
      this.groups.placement.add(details.sprite);
    }
    const sprite = details.sprite;
    sprite.visible = true;
    sprite.active = true;
    sprite.setOrigin(1,1);
    this.placingObject = {id, sprite};
    this.input.on('pointerdown', this.attemptObjectPlacement, this);
  }

  attemptObjectPlacement() {

    let id = this.placingObject.id;

    const woodRequired = woodRequiredForStructure[id];
    if(id=="wall" && !this.hasWallHouse) {
      // TODO: add text object explaining.
      console.log("Can't build wall without a wall workshop!");
      this.cancelAllModes();
      return false;
    }
    if(id=="tower" && !this.hasTowerHouse) {
      // TODO: add text object explaining.
      console.log("Can't build tower without a tower workshop!");
      this.cancelAllModes();
      return false;
    }
    if (this.wood < woodRequired) {
      // TODO: add text object explaining.
      console.log('Insufficient wood for', id);
      this.cancelAllModes();
      return false;
    }

    if (this.input.mousePointer.x <= 264) { 
      return; 
    }
    const [atileX, atileY] = tilePositionOfPixels(
      Math.floor(this.input.mousePointer.x/32)*32, Math.floor(this.input.mousePointer.y/32)*32);
    const tileX = Math.floor(this.input.mousePointer.x/32)*32 + 16;
    const tileY = Math.floor(this.input.mousePointer.y/32)*32 + 15;

    if (this.getObjectInTile(tileX, tileY)!=null) {
      __DEV__ && console.log('Something already occupies that tile!');
      // TODO: play a sound effect or something?
      return;
    }
    if(this.placingObject.id === "tower") {
      if (this.getObjectInTile(tileX+1, tileY)!=null || this.getObjectInTile(tileX, tileY-1)!=null ||
        this.getObjectInTile(tileX+1, tileY-1)!=null) {
        __DEV__ && console.log('Something already occupies that tile!');
        // TODO: play a sound effect or something?
        return;
      }

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
    console.log(x + "/" + y + " wall")
    const sprite = new Building(this, tileX, tileY, properties);
    if(this.placingObject.id === "tower") {
    //  sprite.setOrigin(1,1);
    sprite.y-=25;
    sprite.x-=17;
    sprite.setFrame(0);
      //sprite.setSize(64,32);
    }

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
    if (!this.gameStarted) {
      return;
    }
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
        if (struct.tileset=="wall") {
          struct.wallTop.alpha = struct.alpha;
        }
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
    if (this.step % 300 == 0) {
      this.state++;

      for (let i=0; i<1; i++) {
        this.spawnAttacker();
        this.spawnCreep();
        
        this.scoreText.setText("Score: " + this.score.getScore() + "\nState: " + this.state);
      }
    }
    else {
      return false;
    }
  }


  spawnCreep(setup=false) {
    let found=false;
    let x=0;
    let y=1;
    let startX=271-16;
    let startY=2;
    let iteration=1;
    //random starting corne
    let xMax=31;
    let yMax=23;
    let iMax=Math.min(xMax, yMax);

 
    while(!found) {
      if(iteration==yMax) {
        if(xMax==x) {
          return;
        }
        else {
          x++;
        }
      }
      else if(x==xMax || y==yMax) {
        if(x==iteration) {
          y--;
        }
        else if(y==yMax) {
          x--;
        }
        else {
          y++;
        }
      }
      else {
        if(y==iteration) {
          x++;
        }
        else if(y==iteration+1) {
          iteration++;
          yMax--;
          xMax--;
          x++;
        }
        else if (iteration==iMax) {
          //giveup=true;
          return;
        }
        else{
          y--;
        }
      }
      //console.log("in spawnCreep loop x/y=" + x + "/" + y);
      if(!this.creepInPos((x*32)+startX,(y*32)+startY) && (setup || Math.random() > 0.8)) { // randomly skip
        found=true;
      }
    }
    if (found) {
      //console.log("spawning creep at " + x + "/" + y);
//    let x = 511-320+64+16 + this.randomGen.between(0,30)*32;//this.randomGen.pick([0,1024])+256;
//    let y = 368+16+352;//this.randomGen.pick([0,720]);
      let frame=60;
      if ((y==1) || (y==2 && x<11) || (y==3 && x<5) || (y==4 && x<4) || (y==5 && x<3) || (y==6 && x<2) || (y==7 && x==1) ||
        (y==2 && x>29) || (y==1 && x>30) || (x==31 && y==3) || (x==31 && y>20) || (x==30 && y>21) || (x>26 && y==23) ||
        (y==23 && x<7) || (y>17 && x==1) || (y>18 && x==2) || (y>20 && x==3) || (y==22 && x==4)) {
        frame=10;
      }
      if ((y==11 && x==1) || (y==17 && x==1) || (y==18 && x==2) || (y==19 && x==3) || (y==21 && x==4) || (y==22 && x==6) || (y==23 && x==8)) {
        frame=2;
      }
      if ((x>27 && x<30 && y==22) || (x>23 && x<27 && y==23) || (y==23 && x==7) || (y==22 && x==5)) {
        frame=1;
      }
      if ((x==30 && y==21) || (x==27 && y==22) || (x==23 && y==23) || (x==31 && y==19)) {
        frame=0;
      }
      if ((x==31 && y>3 && y<10) || (x==31 && y==20)) {
        frame=9;
      }
      if ((y==3 && x==30) || (x==31 && y==10)) {
        frame=18;
      }
      if ((y==6 && x==2) || (y==12 && x==1) || (y==13 && x==1) || (y==20 && x==3)) {
        frame=11;
      }
      if ((y==3 && x==10) || (y==4 && x==4) || (y==5 && x==3) || (y==7 && x==2) || (y==8 && x==1) || (y==14 && x==1)) {
        frame=20;
      }
      if ((y==2 && x>10 && x<30) || (y==3 && x>4 && x<10)) {
        frame=19;
      }
      let creep = new Creep(this, (x*32)+startX, (y*32)+startY, frame, null, null);
      //console.log("newcreep at " + (x*32)+startX + "/" + (y*32)+startY);
      this.addSpriteAndCreateBody(creep, this.groups.creep);
      //creep.setFrame(60);
      //creep.resizeAndSetOrgTarget();
      creep.setOrigin(0.5);
      creep.setImmovable(true);
      creep.setAlpha(0);
      var tween = this.tweens.add({
        targets: creep,
        props: {
            alpha: 1
        },
        duration: 1000,
        yoyo: false,
        repeat: 0
      });

      //player.setVelocity(-60,-60);
     // let angle = this.randomGen.angle();
      //let speed = 5;
      //player.setVelocityX(speed * Math.cos(angle));
      //player.setVelocityY(speed * Math.sin(angle));

      this.groups.creep.add(creep, true);
    }
  }

  creepInPos(posX, posY) {
   // let posX2 = (_x*32)+271+32;
    //let posY2 = (_y*32)+16;
    //console.log("len" + this.groups.creep.children.entries);
    //console.log("comparing...");
    for (const sprite of this.groups.creep.children.entries) {
       //console.log("comparing wanted posX/Y " + posX + "/" + posY + " with " + sprite.x + "/" + sprite.y);
      if (posX === sprite.x && posY === sprite.y) {
        return true;
      }
    }
   return false;
  }
  friendlyInPos(posX, posY) {
   // let posX2 = (_x*32)+271+32;
    //let posY2 = (_y*32)+16;
    //console.log("len" + this.groups.creep.children.entries);
    //console.log("comparing...");
    for (const sprite of this.groups.friendlies.children.entries) {
       //console.log("comparing wanted posX/Y " + posX + "/" + posY + " with " + sprite.x + "/" + sprite.y);
      if (posX === sprite.x && posY === sprite.y) {
        return true;
      }
    }
   return false;
  }
  /**
  /**
   * Get the sprite in a tile position, or null if the tile is empty.
   *
   * @returns {Phaser.GameObjects.Sprite | null}
   */
  getObjectInTile(tileX, tileY) {
    console.log("looking fir " + tileX + "/" + tileY);
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
    // TODO : AABB on this and assembling (due to tower), tile based on rest


    for (const sprite of this.groups.buildings.children.entries) {
      const spriteTileX = sprite.x; 
      const spriteTileY = sprite.y; 
        //tilePositionOfPixels(sprite.x, sprite.y);
        //

        console.log("found " + parseInt(sprite.x-(sprite.width/2)) + "/" + parseInt(sprite.y-(sprite.height/2)) + " to "
          + sprite.x+(sprite.width/2) + "/" + sprite.y+(sprite.height/2));
      if (spriteTileX-(sprite.width/2) <= tileX && spriteTileX+(sprite.width/2) >= tileX && 
         spriteTileY-(sprite.height/2) <= tileY && spriteTileY+(sprite.height/2) >= tileY) { 
        console.log("there's a Building here")
        return sprite;
      }
    }
    for (const sprite of this.groups.assembling.children.entries) {
      const [spriteTileX, spriteTileY] =
        tilePositionOfPixels(sprite.x, sprite.y);
      if (spriteTileX-sprite.width/2 >= tileX && spriteTileX+sprite.width/2 <= tileX && 
         spriteTileY-sprite.height/2 >= tileY && spriteTileY+sprite.height/2 <= tileY) { 
        return sprite;
      }
    }

    return null;
  }

  addSpriteAndCreateBody(sprite, group, bodyType = Physics.Arcade.DYNAMIC_BODY) {
    this.physics.world.enable(sprite, bodyType);
    group.add(sprite, true);
    sprite.resizeAndSetOrgTarget();
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
    if(!this.hasBarrack) {
      // TODO: add text object explaining.
      console.log("Can't build soldier without a barracks!");
      return false;
    }
    return this.spawnFriendly(Soldier, 'SoldierSpawn');
  }

  spawnColonist() {
    if(!this.hasFarm) {
      // TODO: add text object explaining.
      console.log("Can't build farmer without a farm!");
      return false;
    }
    return this.spawnFriendly(Colonist, 'ColonistSpawn');
  }

  spawnFriendly(cls, spawnName) {
    let spawn = requireNamedValue(this.friendlySpawns, spawnName);
    while(this.friendlyInPos(spawn.x,spawn.y)) {
      spawn.x-=32;
    }
    const woodRequired = woodRequiredForUnit[cls.name];
    if (this.wood < woodRequired) {
      // TODO: add text object explaining.
      console.log('Insufficient wood for', cls.name);
      return false;
    }
    this.wood -= woodRequired;
    const sprite = new cls(this, spawn.x, spawn.y);
    this.addSpriteAndCreateBody(sprite, this.groups.friendlies);
    sprite.setInteractive().on(
      'pointerdown', event => this.onUnitSelect(event, sprite));
    sprite.setCollideWorldBounds(true);
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

  spawnWood(x,y,amount) {
      let woodSprite = this.add.sprite(x, y, 'tileset');
      woodSprite.setFrame(69);
      var tween = this.tweens.add({
        targets: woodSprite,
        props: {
            alpha: 0
        },
        duration: 1000,
        yoyo: false,
        repeat: 0
      });
      let timedEvent = this.time.addEvent({ delay: 1000, callback: function() { woodSprite.destroy(); }, callbackScope: this});

      this.woodRemaining += amount;
      this.score.wood += amount;
      this.woodText.setText(`Wood: ${this.woodRemaining}`);

   //   this.setWood(this.woodRemaining);
  }

  introScreen() {
    if (this.gameStarted) { 
      return;
    }
    let introGraphics = this.add.graphics();
    introGraphics.fillRect(0, 0, gameWidth, gameHeight);
    introGraphics.setAlpha(1);
    introGraphics.setDepth(100);
    var introTween = this.tweens.add({
        targets: introGraphics,
        props: {
            alpha: 0
        },
        duration: 1000,
        yoyo: false,
        repeat: 0
    });
    let introScreen = this.add.graphics();
    introScreen.fillStyle(0x999999, 1);
    introScreen.fillRect(300, 170, gameWidth-600, gameHeight-300);
    introScreen.setDepth(102);
    let introHeadline = this.add.text(550, 180, 'The Growth', { fontSize: '32px', fill: '#000' });
    introHeadline.setDepth(103);
    let introText = this.add.text(360, 230, 
      'You are the mayor of a village located\n' + 
      'in the middle of a forest, and recently\n' +
      'you have noticed eerie creeper plants\n' +
      'gradually getting closer and closer. \n\n' +
      'One day, a bunch of invading monsters\n' +
      'attacked the village, kicking your\n' +
      'houses and punching your villagers.\n\n' +
      'You decide that enough is enough and \n' +
      'start recruiting farmers to uproot the \n' +
      'creeper plants and soldiers to defend\n' +
      'against the invaders.\n\nHow long can you fight The Growth?'
      , { fontSize: '24px', fill: '#111' });
    introText.setDepth(103);
    this.input.on(
      'pointerdown', function(gfx) { 
        console.log("start "); 
        this.gameStarted = true;  
        introScreen.setVisible(false);
        introText.setVisible(false);
        introHeadline.setVisible(false);
        introGraphics.setVisible(false);
        this.input.removeAllListeners("pointerdown");
      }, this);

//    introGraphics.on('click') ...
  }

  endGame() { 
    if (this.gameover) { 
      return;
    }
    this.gameover = true;
    let graphics = this.add.graphics();
    graphics.fillRect(0, 0, gameWidth, gameHeight);
    graphics.setAlpha(0);
    graphics.setDepth(100);
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
    gameoverScreen.fillRect(300, 170, gameWidth-600, gameHeight-300);
    gameoverScreen.setDepth(102);
    let gameoverText = this.add.text(550, 180, 'Game over', { fontSize: '32px', fill: '#000' });
    gameoverText.setDepth(103);
    let summaryText = this.add.text(360, 230, 'The village has fallen to the Growth!\n\nYour score was: ' 
      + this.score.getScore() + "\n\nYou killed:\n * " + this.score.invaders + " twig monsters\n * " + this.score.bosses 
      + " flower monsters\n * " + this.score.creeps + " growth creeps\n\nYou also harvested " + this.score.wood
      + " pieces of wood,\nand you recruited:\n * " + this.score.farmers + " farmers\n * " + this.score.soldiers + " soldiers", 
      { fontSize: '24px', fill: '#111' });
    summaryText.setDepth(103);
  }  
}
