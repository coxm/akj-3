export const mapWidth = 1024;
export const mapHeight = 768;

export const menuWidth = 256;
export const menuHeight = mapHeight;

export const gameWidth = mapWidth + menuWidth;
export const gameHeight = Math.max(mapHeight, menuHeight);


export const tileWidth = 32;
export const tileHeight = 32;


export const tilesetName = 'tileset';


/** Sprite frames within the tileset. */
export const ditchFrame = 65;
export const towerFrame = 67;
export const wallFrame = 103;


/** The health gained on each update by a structure during construction. */
export const structureAssembleRate = 2;


/** Sprite max health. */
export const ditchMaxHealth = 50;
export const towerMaxHealth = 150;
export const wallMaxHealth = 120;


/** Attacker properties. */
export const weedProperties = {
  speed: 0,
  attackRadius: tileWidth*2+2,
  attackStrength: 1,
  maxHealth: 10,
  tileset: 'weed-monster',
  frame: 0,
  isFriendly: false,
  height: 32,
  width: 32,
};
export const twigProperties = {
  speed: 40,
  attackRadius: tileWidth*2+2,
  attackStrength: 1,
  maxHealth: 50,
  tileset: 'twig-monster',
  frame: 0,
  isFriendly: false,
  height: 26,
  width: 26,
};
export const flowerProperties = {
  speed: 30,
  attackRadius: tileWidth+2,
  attackStrength: 3,
  maxHealth: 200,
  tileset: 'flower-monster',
  frame: 0,
  isFriendly: false,
  height: 60,
  width: 40,
};
export const soldierProperties = {
  speed: 42,
  attackRadius: tileWidth*2+2,
  attackStrength: 4,
  maxHealth: 150,
  tileset: 'soldier',
  frame: 0,
  isFriendly: true,
  height: 28,
  width: 24,
};
export const colonistProperties = {
  speed: 32,
  attackRadius: tileWidth*2+2,
  attackStrength: 2,
  maxHealth: 100,
  tileset: 'farmer',
  frame: 0,
  isFriendly: true,
  height: 28,
  width: 16,
};
//Buildings
export const barracksProperties = {
  speed: 0,
  attackRadius: 0,
  attackStrength: 0,
  maxHealth: 400,
  frame: 0,
  isFriendly: true,
  tileset: 'barracks',
};
export const farmProperties = {
  speed: 0,
  attackRadius: 0,
  attackStrength: 0,
  maxHealth: 300,
  frame: 0,
  isFriendly: true,
  tileset: 'farm',
};
export const townHallProperties = {
  speed: 0,
  attackRadius: 0,
  attackStrength: 0,
  maxHealth: 1000,
  frame: 0,
  isFriendly: true,
  tileset: 'townHall',
};
export const townHouseProperties = {
  speed: 0,
  attackRadius: 0,
  attackStrength: 0,
  maxHealth: 300,
  frame: 0,
  isFriendly: true,
  tileset: 'townHouse',
};
export const wallProperties = {
  speed: 0,
  attackRadius: 0,
  attackStrength: 0,
  maxHealth: 100,
  frame: 1,
  isFriendly: true,
  tileset: 'wall',
};
export const towerProperties = {
  speed: 0,
  attackRadius: 128,
  attackStrength: 3,
  maxHealth: 150,
  frame: 1,
  isFriendly: true,
  tileset: 'tower',
};


export const woodRequiredForUnit = {
  Soldier: 30,
  Colonist: 20,
};


export const woodRequiredForStructure = {
  ditch: 5,
  tower: 50,
  wall: 10,
};


export const woodGainedFromKilling = {
  Weed: 10,
  Twig: 50,
  Flower: 100,
};


/** The initial wood in the player's stockpile. */
export const initialWood = 100;
