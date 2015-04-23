
var CartoDB = require('cartodb'),
       util = require('util');

function Client() {
  /* jshint -W058 */
  var that = this;
  // Parent constructor
  CartoDB.apply(that, arguments);
}


// Inheritance from Strem
util.inherits(Client, CartoDB);

module.exports = Client;
