'use strict';

var rest = require('restler');

// create a service constructor
// for very easy API wrappers on
module.exports = rest.service(function(hash) {
  var user = hash.user || "cartodb";
  this.baseURL = "https://" + user + ".cartodb.com/api/";
});
