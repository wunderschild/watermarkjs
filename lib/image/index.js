import { identity } from '../functions';

/**
 * @typedef {String|Blob|HTMLImageElement} Resource
 * @typedef {import('../canvas/pool').CanvasPool} CanvasPool
 * @typedef {(img: HTMLImageElement) => unknown} Initializer
 */

/**
 * Set the src of an image object and call the resolve function
 * once it has loaded
 *
 * @param {HTMLImageElement} img
 * @param {String} src
 * @param {Function} resolve
 */
function setAndResolve(img, src, resolve) {
  img.onload = () => resolve(img);
  img.src = src;
}

/**
 * @typedef {(res: Resource, init?: Initializer) => Promise<HTMLImageElement>} Loader
 */

/**
 * Given a resource, return an appropriate loading function for it's type
 *
 * @param {Resource} resource
 * @return {Loader}
 */
export function getLoader(resource) {
  const type = typeof (resource);

  if (type === 'string') {
    return /** @type {Loader} */ (loadUrl);
  }

  if (resource instanceof HTMLImageElement) {
    return /** @type {Loader} */ (identity);
  }

  return /** @type {Loader} */ (/** @type {unknown} */ (loadFile));
}

/**
 * Used for loading image resources asynchronously and maintaining
 * the supplied order of arguments
 *
 * @param {Array<Resource>} resources - a mixed array of urls, File objects, or Image objects
 * @param {Initializer=} init - called at the beginning of resource initialization
 * @return {Promise<HTMLImageElement[]>}
 */
export function load(resources, init) {
  let promises = [];
  for (var i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const loader = getLoader(resource);
    const promise = loader(resource, init);
    promises.push(promise);
  }
  return Promise.all(promises);
}

/**
 * Load an image by its url
 *
 * @param {String} url
 * @param {Function} init - an optional image initializer
 * @return {Promise<HTMLImageElement>}
 */
export function loadUrl(url, init) {
  const img = new Image();
  (typeof (init) === 'function') && init(img);
  return new Promise(resolve => {
    img.onload = () => resolve(img);
    img.src = url;
  });
}

/**
 * Return a collection of images from an
 * array of File objects
 *
 * @param {File} file
 * @return {Promise<HTMLImageElement>}
 */
export function loadFile(file) {
  const reader = new FileReader();
  return new Promise(resolve => {
    const img = new Image();
    reader.onloadend = () => setAndResolve(img,  /** @type {String} */(reader.result), resolve);
    reader.readAsDataURL(file);
  });
}

/**
 * Create a new image, optionally configuring its onload behavior
 *
 * @param {String} url
 * @param {((...args: any[]) => any)=} onload
 * @return {HTMLImageElement}
 */
export function createImage(url, onload) {
  const img = new Image();
  if (typeof (onload) === 'function') {
    img.onload = onload;
  }
  img.src = url;
  return img;
}

/**
 * Draw an image to a canvas element
 *
 * @param {HTMLImageElement} img
 * @param {HTMLCanvasElement} canvas
 * @return {HTMLCanvasElement}
 */
function drawImage(img, canvas) {
  const ctx = canvas.getContext('2d');

  if (ctx === null) return canvas;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Convert an Image object to a canvas
 *
 * @param {HTMLImageElement} img
 * @param {CanvasPool} pool
 * @return {HTMLCanvasElement}
 */
export function imageToCanvas(img, pool) {
  const canvas = pool.pop();
  return drawImage(img, canvas);
}

/**
 * Convert an array of image objects
 * to canvas elements
 *
 * @param {HTMLImageElement[]} images
 * @param {CanvasPool} pool
 * @return {HTMLCanvasElement[]}
 */
export function mapToCanvas(images, pool) {
  return images.map(img => imageToCanvas(img, pool));
}
