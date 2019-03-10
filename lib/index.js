'use strict';

const { Stream } = require('stream');
const CartoDB = require('cartodb');
const rest = require('./rest');
const util = require('util');


function CartodbLayers({ user, api_key }) {
  // Parent constructor
  Stream.call(this);
  // Pass current arguments to the CartoDB constructor
  this.client = new CartoDB.SQL({ user, api_key });
  // Create a rest client
  this.rest = rest({ user, api_key });
  return this;
}

// Inheritance from Strem
util.inherits(CartodbLayers, Stream);

module.exports = CartodbLayers;
