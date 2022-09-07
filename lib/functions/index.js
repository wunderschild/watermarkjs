/**
 * Return a function that executes a sequence of functions from left to right,
 * passing the result of a previous operation to the next
 *
 * @param {...((value: any) => any)} funcs
 * @return {(value: any) => any}
 */
export function sequence(...funcs) {
  return function (value) {
    return funcs.reduce((val, fn) => fn.call(null, val), value);
  };
}

/**
 * Return the argument passed to it
 *
 * @template T
 * @param {T} x
 * @return {T}
 */
export function identity(x) {
  return x;
}
