'use strict';

var rest = require('restler');

// create a service constructor
// for very easy API wrappers on
module.exports = rest.service(function(hash) {
  this.api_key = hash.api_key;
  this.user    = hash.user || "cartodb";
  this.baseURL = "https://" + this.user + ".cartodb.com/api/";
}, {}, {
  buildQuery: function(page, per_page) {
    return {
      page: Math.max(page || 1, 1),
      per_page: Math.min(per_page || 10, 10),
      // To allow type filtering we must add an API Key to the request
      api_key: this.api_key
    };
  },
  // List of user's visualizations
  layers: function() {
    var query = this.buildQuery.apply(this, arguments);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    query.type = 'derived';
    return this.get('v1/viz/', { query:  query });
  },
  // List of user's tables
  tables: function() {
    var query = this.buildQuery.apply(this, arguments);
    query.type = 'table';
    return this.get('v1/viz/', { query:  query });
  },
  // Get a single one visualization
  viz: function(id) {
    var query = this.buildQuery.apply(this);
    return this.get('v2/viz/' + id + '/viz.json', { query:  query });
  }
});
