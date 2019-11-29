'use strict';

const { Stream } = require('stream');
const CartoDB = require('cartodb');
const Rest = require('./rest');
const Turbocarto = require('./turbocarto')
const util = require('util');

/**
 * Main class to expose all the module of this library
 * @class
 * @property {CartoDB.SQL} client - CartoDB SQL client
 * @property {Rest} rest - Rest client
 * @property {Turbocarto} turbocarto - TruboCARTO client
 * @param {String} [args.user=cartodb] - CARTO username
 * @param {String} args.api_key - CARTO api key
 */
function CartodbLayers({ user, api_key }) {
  // Parent constructor
  Stream.call(this);
  // Pass current arguments to the CartoDB constructor
  this.client = new CartoDB.SQL({ user, api_key });
  // Create a rest client
  this.rest = new Rest({ user, api_key });
  // Create a Turbocarto Preprocessor which uses the rest client
  this.turbocarto = new Turbocarto(this.rest);
  return this;
}

// Inheritance from Strem
util.inherits(CartodbLayers, Stream);

module.exports = CartodbLayers;
