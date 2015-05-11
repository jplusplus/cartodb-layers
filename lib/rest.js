'use strict';

var rest = require('restler'),
       _ = require('lodash'),
  events = require('events');

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
  },
  // Get static map information for a given viz
  static: function(id) {
    var emitter = new events.EventEmitter();
    // Isolate current Rest instance
    var that = this;
    // Get the visualization details
    that.viz(id).on("complete", function(viz) {
      // Build the mapconfig object
      // @see https://github.com/CartoDB/Windshaft/blob/0.19.1/doc/MapConfig-1.1.0.md
      var layergroup = _.find(viz.layers, { type: 'layergroup' });
      // Get the basemap layer
      var basemap = _.find(viz.layers, { type: 'tiled' });
      // No basemap found
      if( !basemap ) {
        // Use a default basemap
        basemap =  {
          "urlTemplate":"http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "subdomains":"1234"
        };
      }
      // Find the basemap configuration
      // The viz must have at least one layergroup
      if( !layergroup ) {
        // Emits an error
        emitter.emit("error", "This visualization doesn't contain any layergroup.");
      } else {
        // Create a list of layers to show
        var layers = [ { type: 'http', options: basemap.options } ];
        // The layergroup defines several layers
        layergroup.options.layer_definition.layers.forEach(function(layer) {
          // Add grouplayers to map config
          layers.push({
            type: "cartodb",
            options: layer.options
          });
        });
        // Get the static map attributes
        that.json('POST', 'v1/map/', { layers: layers }).on('complete', function(result) {
          // Simply call the parent event emitter
          emitter.emit("complete", {
            http  : result.cdn_url.http,
            https : result.cdn_url.https,
            user  : that.user,
            token : result.layergroupid,
            bounds: [ viz.bounds[0][1], viz.bounds[0][0], viz.bounds[1][1], viz.bounds[1][0] ]
          });
        });
      }
    });
    // Returns the event emitter
    // which is resolved after a few requests
    return emitter;
  },
  // Search a layer by its name
  search: function(q, type, page, per_page) {
    var query = this.buildQuery.apply(this, [page, per_page]);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    query.type = type || 'derived';
    query.q    = q;
    return this.get('v1/viz/', { query:  query });
  },
  // Convert the given static informations into an image URL
  image: function(config, width, height, protocol, format) {
    // Set default values
    protocol = protocol || 'https';
    format   = format   || 'png';
    width    = width    || 300;
    height   = height   || 170;
    // joins parameters
    return [
      protocol + '://' + config[protocol],
      config.user,
      'api/v1/map/static/bbox',
      config.token,
      config.bounds.join(","),
      width,
      height + '.' + format
    ].join("/");
  },
  // Get layer's fields
  fields: function(id) {
    var emitter = new events.EventEmitter();
    // Isolate current Rest instance
    var that = this;
    // Get the visualization details
    that.viz(id).on("complete", function(viz) {
      // Find the table id
      var layergroup = _.find(viz.layers, { type: 'layergroup' });
      // Store the name of the table
      var table = null;
      // A layergroup exists
      if(layergroup && layergroup.options.layer_definition) {
        // For each layer inside the layer definition
        (layergroup.options.layer_definition.layers || []).forEach(function(layer) {
          table = layer.options.layer_name;
        });
        // We found the table name
        if(table !== null) {
          var query = that.buildQuery.apply(that);
          // Build the SQL query
          query.q = "select * from (select * from " + table + ") __wrapped limit 0";
          // Use rest api to extract table's field
          that.get('v2/sql', { query: query }).on("complete", function(stat) {
            emitter.emit("complete", stat.fields);
          });
        } else {
          // Emit an error
          emitter.emit("error", "The layer has no data.");
        }
      } else {
        // Emit an error
        emitter.emit("error", "The layer enumerates no data layer.");
      }
    });

    return emitter;
  }
});
