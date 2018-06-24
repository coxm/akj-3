export const mapWidth = 1024;
export const mapHeight = 768;

export const menuWidth = 256;
export const menuHeight = mapHeight;

export const gameWidth = mapWidth + menuWidth;
export const gameHeight = Math.max(mapHeight, menuHeight);


export const tileWidth = 16;
export const tileHeight = 16;


export const tilesetName = 'apoc16x16-img';


/** Sprite frames within the tileset. */
export const colonistFrame = 47;
export const ditchFrame = 160;
export const flowerFrame = 771;
export const soldierFrame = 46;
export const towerFrame = 130;
export const twigFrame = 122;
export const wallFrame = 465;


/** The health gained on each update by a structure during construction. */
export const structureAssembleRate = 2;


/** Sprite max health. */
export const ditchMaxHealth = 50;
export const towerMaxHealth = 150;
export const wallMaxHealth = 120;


/** Attacker properties. */
export const weedProperties = {
  attackRadius: tileWidth,
  attackStrength: 5,
  maxHealth: 20,
};
export const twigProperties = {
  speed: 16,
  attackRadius: tileWidth,
  attackStrength: 8,
  maxHealth: 100,
};
export const flowerProperties = {
  speed: 4,
  attackRadius: tileWidth,
  attackStrength: 30,
  maxHealth: 200,
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
