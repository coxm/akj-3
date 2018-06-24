import {tileWidth, tileHeight} from './settings';


export const randInRange = (min, max) => Math.random() * (max - min) + min;

export const randIntInRange = (min, max) => Math.floor(randInRange(min, max));

export const randElement = array =>
  array[randIntInRange(0, array.length) % array.length];


export const requireNamedValue = (array, name, warningIfMissing)  => {
  const value = array.find(val => val.name === name);
  if (!value) {
    throw new Error(`Value named '${name}' missing in array`);
  }
  return value;
};


export const tilePositionOfPixels = (x, y) => [
  Math.floor(x / tileWidth + 0.5),
  Math.floor(y / tileHeight + 0.5)
];


export const distSquared = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
};


export const distance = (x1, y1, x2, y2) =>
  Math.sqrt(distSquared(x1, y1, x2, y2));
