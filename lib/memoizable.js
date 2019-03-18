const difference = require('lodash/difference');
const memoize = require('lodash/memoize');
const pull = require('lodash/pull');
const reduce = require('lodash/reduce');
const throttle = require('lodash/throttle');

const _memoized = Symbol('memoized')

class Memoizable {
  constructor () {
    if (this.constructor === Memoizable) {
      throw new Error("Can't instantiate abstract class!");
    }
  }
  throttled (wait = null) {
    return reduce(this.methods, (map, key) => {
      const fn = this[key].bind(this)
      map[key] = wait === null ? memoize(fn) : throttle(null, fn)
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
