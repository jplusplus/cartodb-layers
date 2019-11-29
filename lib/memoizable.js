const difference = require('lodash/difference');
const memoize = require('lodash/memoize');
const pull = require('lodash/pull');
const reduce = require('lodash/reduce');
const throttle = require('lodash/throttle');

const _memoized = Symbol('memoized')

/**
 * Abstract Class to implement memoized methods
 * @abstract
 * @property {Object} methods - All the methods of the class
 * @property {Object} memoized - All the methods of the class, but memoized (no expiration)
 */
class Memoizable {
  constructor () {
    if (this.constructor === Memoizable) {
      throw new Error("Can't instantiate abstract class!");
    }
  }
  /**
   * Returns the methods of the class, wrapped inside a throttled function
   * @param {Number} [wait=null] - Throttle duration in millisecond. The `null` means no limitations.
   * @return {Object} All the methods of the class
   */
  throttled (wait = null) {
    return reduce(this.methods, (map, key) => {
      const fn = this[key].bind(this)
      map[key] = wait === null ? memoize(fn) : throttle(fn, wait)
      return map
    }, {})
  }
  get memoized () {
    this[_memoized] = this[_memoized] || this.throttled()
    return this[_memoized]
  }
  get methods() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype);
    // Remove the non-callable attribute
    pull(methods, key => typeof this[key] === 'function')
    // Remove the constructor from the method list (as he won't be memoized)
    return difference(methods, ['constructor'])
  }

}

module.exports = Memoizable
