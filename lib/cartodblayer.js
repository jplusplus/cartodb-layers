'use strict';

var CartoDB = require('cartodb'),
     Stream = require('stream').Stream,
       util = require('util');

function CartodbLayers() {
  var that = this;
  // Parent constructor
  Stream.call(that);
  // Pass current arguments to the CartoDB constructor
  var args = Array.prototype.concat.apply([null], arguments);
  /* jshint -W058 */
  that.client = new (Function.prototype.bind.apply(CartoDB, args));
  // Emit an event when the client successfully connect
  that.client.on('connect', function() {
    that.emit("connect");
  });
  return that;
}

// Inheritance from Strem
util.inherits(CartodbLayers, Stream);

CartodbLayers.prototype.connect = function() {
  // Connect the CartoDB client
  this.client.connect();
};

module.exports = CartodbLayers;
