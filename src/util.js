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
