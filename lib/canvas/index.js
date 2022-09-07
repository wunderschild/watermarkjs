/**
 * Parameters object for {dataUrl} function.
 *
 * @typedef {Object} DataUrlParameters
 * @property {string | undefined} type Image MIME type
 * @property {any | undefined} quality Image quality
 */

/**
 * Get the data url of a canvas
 *
 * @param {HTMLCanvasElement} canvas
 * @param {DataUrlParameters} parameters
 * @return {String}
 */
export function dataUrl(canvas, parameters = { type: 'image/png', quality: 0.92 }) {
  return canvas.toDataURL(parameters.type, parameters.quality);
}
