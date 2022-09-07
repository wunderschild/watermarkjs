import { load, mapToCanvas, createImage } from './image';
import { dataUrl as mapToDataUrl } from './canvas';
import { blob as mapToBlob } from './blob';
import * as style from './style';
import { clone, extend } from './object';
import pool from './canvas/pool';

/**
 * @typedef {import('./canvas/pool').CanvasPool} CanvasPool
 * @typedef {'image/png' | 'image/jpeg'} ImageFormat
 * @typedef {import('./image').Resource} Resource
 * @typedef {import('./image').Initializer} Initializer
 */

/**
 * A configuration type for the watermark function
 *
 * @typedef {Object} Options
 * @property {Initializer} init - an initialization function that is given Image objects before loading (only applies if resources is a collection of urls)
 * @property {ImageFormat} type - specify the image format to be used when retrieving result (only supports "image/png" or "image/jpeg", default "image/png")
 * @property {Number} encoderOptions - specify the image compression quality from 0 to 1 (default 0.92)
 * @property {Number=} poolSize - number of canvas elements available for drawing,
 * @property {CanvasPool=} pool - the pool used. If provided, poolSize will be ignored
 */

/**
 * @constant
 * @type {Options}
 */
const defaults = {
  init: () => {
  },
  type: 'image/png',
  encoderOptions: 0.92,
};

/**
 * Merge the given options with the defaults
 *
 * @param {Partial<Options>} options
 * @return {Options}
 */
function mergeOptions(options) {
  // @ts-ignore
  return extend(clone(defaults), options);
}

/**
 * Release canvases from a draw result for reuse. Returns
 * the dataURL from the result's canvas
 *
 * @param {import('./style').DrawResult} result
 * @param {CanvasPool} pool
 * @param {import('./canvas').DataUrlParameters} parameters
 * @return  {String}
 */
function release(result, pool, parameters) {
  const { canvas, sources } = result;
  const dataURL = mapToDataUrl(canvas, parameters);
  sources.forEach((v) => pool.release(v));
  return dataURL;
}

/**
 * @template T
 * @typedef {Pick<Promise<T>, 'then'>} Thenable
 */

/**
 * @typedef {import('./style').Drawer} Drawer
 */

/**
 * @template T
 * @typedef {Object} Watermark
 * @property {Thenable<T>['then']} then
 * @property {(draw: Drawer) => Thenable<String>} dataUrl
 * @property {(draw: Drawer) => Thenable<Blob>} blob
 * @property {(draw: Drawer) => Thenable<HTMLImageElement>} image
 * @property {(resources: Resource[], init?: Initializer) => Watermark<HTMLImageElement[]>} load
 * @property {() => Watermark<HTMLImageElement[]>} render
 */

/**
 * Return a watermark object
 *
 * @template T
 * @param {Array<Resource>} resources - a collection of urls, File objects, or Image objects
 * @param {Partial<Options>} options - a configuration object for watermark
 * @param {Promise<T> | null} promise - optional
 * @return {Watermark<T>}
 */
export default function watermark(resources, options = {}, promise = null) {
  const opts = mergeOptions(options);
  promise || (promise = /** @type {Promise<T>} */ (load(resources, opts.init)));

  return {
    /**
     * @this {Watermark<HTMLImageElement[]>}
     */
    dataUrl(draw) {
      const promise = (this)
        .then(images => mapToCanvas(images, pool))
        .then(canvases => style.result(draw, canvases))
        .then(result => release(result, pool,
          { type: opts.type, quality: opts.encoderOptions },
        ));

      return watermark(resources, opts, promise);
    },

    /**
     * @this {Watermark<HTMLImageElement[]>}
     */
    load(resources, init) {
      const promise = (this)
        .then((resource) => load((/** @type {Resource[]} */ (resource)).concat(resources), init));

      return watermark(resources, opts, promise);
    },

    /**
     * @this {Watermark<HTMLImageElement[]>}
     */
    render() {
      const promise = this
        .then(resource => load(resource));

      return watermark(resources, opts, promise);
    },

    /**
     * @this {Watermark<HTMLImageElement[]>}
     */
    blob(draw) {
      const promise = this.dataUrl(draw)
        .then((v) => mapToBlob(v));

      return watermark(resources, opts, promise);
    },

    /**
     * @this {Watermark<HTMLImageElement[]>}
     */
    image(draw) {
      const promise = this.dataUrl(draw)
        .then(createImage);

      return watermark(resources, opts, promise);
    },

    then(fn) {
      const pms = promise || Promise.resolve(undefined);
      return (pms.then(fn));
    },
  };
};

/**
 * Style functions
 */
watermark.image = style.image;
watermark.text = style.text;

/**
 * Clean up all canvas references
 */
watermark.destroy = () => pool.clear();
