import { sequence } from '../functions';

const url = /^data:([^;]+);base64,(.*)$/;

/**
 * Split a data url into a content type and raw data
 *
 * @param {String} dataUrl
 * @return {Array<String> | null}
 */
export function split(dataUrl) {
  let results = url
    .exec(dataUrl);
  if (results === null) return null;
  return results
    .slice(1);
}

/**
 * Decode a base64 string
 *
 * @param {String} base64
 * @return {String}
 */
export function decode(base64) {
  return window.atob(base64);
}

/**
 * Return a string of raw data as a Uint8Array
 *
 * @param {String} data
 * @return {Uint8Array}
 */
export function uint8(data) {
  const length = data.length;
  const uints = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uints[i] = data.charCodeAt(i);
  }

  return uints;
}

/**
 * Turns a data url into a blob object
 *
 * @param {String} dataUrl
 * @return {Blob}
 */
export const blob = /** @type {(str: String) => Blob} */ (sequence(
  split,
  parts => [decode(parts[1]), parts[0]],
  blob => new Blob([uint8(blob[0])], { type: blob[1] }),
));
