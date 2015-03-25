'use strict';

var CartoDB = require('cartodb'),
     Stream = require('stream').Stream,
       Rest = require('./rest'),
       util = require('util');

function CartodbLayers() {
  /* jshint -W058 */
  var that = this;
  // Parent constructor
  Stream.call(that);
  // Pass current arguments to the CartoDB constructor
  var args = Array.prototype.concat.apply([null], arguments);
  that.client = new (Function.prototype.bind.apply(CartoDB, args));
  // Emit an event when the client successfully connect
  that.client.on('connect', function() {
    that.emit("connect");
  });
  // Create a rest client
  that.rest = new (Function.prototype.bind.apply(Rest, args));
  return that;
}

// Inheritance from Strem
util.inherits(CartodbLayers, Stream);

CartodbLayers.prototype.connect = function() {
  // Connect the CartoDB client
  this.client.connect();
};

module.exports = CartodbLayers;
