export const randInRange = (min, max) => Math.random() * (max - min) + min;

export const randIntInRange = (min, max) => Math.floor(randInRange(min, max));

export const randElement = array =>
  array[randIntInRange(0, array.length) % array.length];
