'use strict';

var rest = require('restler');

// create a service constructor
// for very easy API wrappers on
module.exports = rest.service(function(hash) {
  var user = hash.user || "cartodb";
  this.baseURL = "https://" + user + ".cartodb.com/api/";
}, {}, {
  // List of user's visualizations
  layers: function(page, per_page) {
    var query = {
      page    : page || 1,
      per_page: per_page || 20,
      // The viz endpoint must be filtered by type 'derived' to
      // display only vizualisations (that we call 'layers').
      type    : 'derived'
    };
    return this.get('v1/viz/', { query: query });
  }
});
