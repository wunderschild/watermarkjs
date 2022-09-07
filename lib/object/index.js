/**
 * Extend one object with the properties of another
 *
 * @template {{}} T
 * @template {{}} K
 * @param {T} first
 * @param {K} second
 * @return {T & K}
 */
export function extend(first, second) {
  const third = /** @type {T & K} */ (first);
  const secondKeys = /** @type {(keyof K)[]} */ (Object.keys(second));
  secondKeys.forEach(key => third[key] = /** @type {(T & K)[keyof K]} */ (second[key]));
  return third;
}

/**
 * Create a shallow copy of the object
 *
 * @param {Object} obj
 * @return {Object}
 */
export function clone(obj) {
  return extend({}, obj);
}
