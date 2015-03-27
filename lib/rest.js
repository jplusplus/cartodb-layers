'use strict';

var rest = require('restler');

// create a service constructor
// for very easy API wrappers on
module.exports = rest.service(function(hash) {
  this.api_key = hash.api_key;
  this.user    = hash.user || "cartodb";
  this.baseURL = "https://" + this.user + ".cartodb.com/api/";
}, {}, {
  // List of user's visualizations
  layers: function(page, per_page) {
    var query = {
      page: Math.max(page || 1, 1),
      per_page: Math.min(per_page || 10, 10),
      // The viz endpoint must be filtered by type 'derived' to
      // display only vizualisations (that we call 'layers').
      type: 'derived',
      // To allow type filtering we must add an API Key to the request
      api_key: this.api_key
    };
    return this.get('v1/viz/', { query:  query });
  }
});
