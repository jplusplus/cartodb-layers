'use strict';

var rest = require('restler'),
       _ = require('lodash'),
       Q = require('q'),
  crypto = require('crypto');

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
    var deferred = Q.defer();
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    query.type = 'derived';
    this.get('v1/viz/', { query:  query }).on("complete", deferred.resolve);
    return deferred.promise;
  },
  // List of user's tables
  tables: function() {
    var query = this.buildQuery.apply(this, arguments);
    var deferred = Q.defer();
    query.type = 'table';
    this.get('v1/viz/', { query:  query }).on("complete", deferred.resolve);
    return deferred.promise;
  },
  // Get a single one visualization
  viz: function(id) {
    var query = this.buildQuery.apply(this);
    var deferred = Q.defer();
    // Isolate current Rest instance
    var that = this;
    // Get the viz
    this.get('v2/viz/' + id + '/viz.json', { query:  query }).on('complete', function(viz) {
      // Get the mapconfig object
      if( _.find(viz.layers, { type: 'layergroup' }) ) {
        // Just send the viz
        deferred.resolve(viz);
      } else {
        // Find a namedmap
        var namedmap = _.find(viz.layers, { type: 'namedmap' });
        // Add namedmap is given (private dataset)
        if( namedmap ) {
          // Template name is used to retreive layergroup
          var tpl = namedmap.options.named_map.name;
          var query = that.buildQuery();
          // Find the layergroup
          that.get('v1/map/named/' + tpl, { query: query }).on('complete', function(named) {
            // Create a layergroup
            var layer = {
              type: 'layergroup',
              // Duplicated namedmap options
              options: _.cloneDeep(namedmap.options)
            };
            // Add the layer definition to the options
            layer.options.layer_definition = named.template ? named.template.layergroup : null;
            // Add it to the layer list
            viz.layers.push(layer);
            // Just send the viz
            deferred.resolve(viz);
          });
        }
      }
    });
    // Returns the event emitter
    // which is resolved after a few requests
    return deferred.promise;
  },
  // Gets a NamedMap
  named: function(name) {
    var deferred = Q.defer();
    this.get('v1/map/named/' + name,  { query: this.buildQuery() }).on("complete", deferred.resolve);
    return deferred.promise;
  },
  // Gets a NamedMap
  instanciate: function(name, data) {
    var deferred = Q.defer();
    this.post('v1/map/named/' + name, {
      headers: {
        'Content-Type': 'application/json'
      },
      query: this.buildQuery(),
      data: JSON.stringify(data)
    }).on("complete", deferred.resolve);
    return deferred.promise;
  },
  // Generate a NamedMap for the given viz
  projection: function(id, name, cartocss, sql) {
    var deferred = Q.defer();
    // Isolate current Rest instance
    var that = this;
    // Create a hash for the viz id
    var hash = crypto.createHash("sha256").update(id).digest('hex');
    // Default name uses viz id
    name = name || ("tpl_" + hash);
    // Get the visualization
    that.viz(id).then(function(viz) {
      var query = that.buildQuery.apply(that);
      // Find a layergroup
      var layergroup = _.find(viz.layers, { type: 'layergroup' });
      // Build configuration
      var mapconfig = {
        "version": "0.0.1",
        "name": name,
        "auth": {"method": "open"},
        "placeholders": {
          "layer0": {
            "type": "number",
            "default": 1
          }
        },
        "layergroup": {
          "layers": [{
            "type": "cartodb",
            "options": {
              "cartocss_version": "2.1.1",
              "cartocss": cartocss || layergroup.options.layer_definition.layers[0].options.cartocss,
              "sql": sql || layergroup.options.layer_definition.layers[0].options.sql,
              "interactivity": layergroup.options.layer_definition.layers[0].options.interactivity
            }
          }]
        }
      };
      // Remove existing projection first
      that.del('v1/map/named/' + name, { query: query }).on('complete', function() {
        // Get the visualization details
        that.post('v1/map/named', {
          headers: {
            'Content-Type': 'application/json'
          },
          query: query,
          data: JSON.stringify(mapconfig)
        }).on('complete', function() {
          deferred.resolve(mapconfig);
        });
      });
    });
    // Returns the event emitter
    // which is resolved after a few requests
    return deferred.promise;
  },
  // Get static map information for a given viz
  static: function(id, noBasemap) {
    var deferred = Q.defer();
    // Isolate current Rest instance
    var that = this;
    // Get the visualization details
    that.viz(id).then(function(viz) {
      // Build the mapconfig object
      // @see https://github.com/CartoDB/Windshaft/blob/0.19.1/doc/MapConfig-1.1.0.md
      var layergroup = _.find(viz.layers, { type: 'layergroup' });
      // The viz may contains a namedmap
      var namedmap = _.find(viz.layers, { type: 'namedmap' });
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
      // Create a list of layers to show
      var layers = noBasemap ? [] : [ { type: 'http', options: basemap.options } ];
      // Find the basemap configuration
      // The viz must have at least one layergroup
      if( layergroup && !namedmap) {
        // The layergroup defines several layers
        layergroup.options.layer_definition.layers.forEach(function(layer) {
          // Add grouplayers to map config
          layers.push({
            type: "cartodb",
            options: layer.options
          });
        });
      }

      that.projection(id).then(function(named) {
        that.instanciate(named.name).then(function(instance) {
          // Get the static map attributes
          that.json('POST', 'v1/map/', { layers: layers }).on('complete', function(result) {
            // Add default cdn values
            result.cdn_url = result.cdn_url || {
              "http": "api.cartocdn.com",
              "https": "cartocdn.global.ssl.fastly.net"
            };
            // Simply call the parent event emitter
            deferred.resolve({
              http  : result.cdn_url.http,
              https : result.cdn_url.https,
              user  : that.user,
              token : instance.layergroupid,
              center: [ viz.zoom ].concat( JSON.parse(viz.center) ),
              bounds: [ viz.bounds[0][1], viz.bounds[0][0], viz.bounds[1][1], viz.bounds[1][0] ]
            });
          });
        });
      });
    });
    // Returns the event emitter
    // which is resolved after a few requests
    return deferred.promise;
  },
  // Search a layer by its name
  search: function(q, type, page, per_page) {
    var deferred = Q.defer();
    var query = this.buildQuery.apply(this, [page, per_page]);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    query.type = type || 'derived';
    query.q    = q;
    this.get('v1/viz/', { query:  query }).on('complete', deferred.resolve);
    return deferred.promise;
  },
  // Convert the given static informations into an image URL
  image: function(config, width, height, protocol, format, useCenter) {
    // Set default values
    protocol = protocol || 'https';
    format   = format   || 'png';
    width    = width    || 300;
    height   = height   || 170;
    // joins parameters
    return [
      protocol + '://' + config[protocol],
      config.user,
      'api/v1/map/static',
      (useCenter ? 'center': 'bbox'),
      config.token,
      (useCenter ? config.center.join("/") : config.bounds.join(",") ),
      width,
      height + '.' + format
    ].join("/");
  },
  // Get data for a given layer
  data: function(id) {
    var deferred = Q.defer();
    // Isolate current Rest instance
    var that = this;
    // Get the visualization details
    that.viz(id).then(function(viz) {
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
          query.q = "select * from " + table;
          // Use rest api to extract table's field
          that.get('v2/sql', { query: query }).on('complete', function(result) {
            deferred.resolve(result);
          });
        } else {
          // Emit an error
          deferred.reject("The layer has no data.");
        }
      } else {
        // Emit an error
        deferred.reject("The layer enumerates no data layer.");
      }
    });

    return deferred.promise;
  },
  // Get layer's fields
  fields: function(id) {
    var deferred = Q.defer();
    // Isolate current Rest instance
    var that = this;
    // Get the visualization details
    that.projection(id).then(function(named) {
      var sql = null;
      var query = that.buildQuery.apply(that);
      // Get the layer's SQL
      named.layergroup.layers.forEach(function(layer) {
        sql = _.template(layer.options.sql)({ layer0: 1 });
      });
      // No SQL avalaible
      if(!sql) {
        return deferred.reject("The layer has no data.");
      }
      // Build the SQL query
      query.q = "select * from (" + sql + ") __wrapped limit 0";
      // Use rest api to extract table's field
      that.get('v2/sql', { query: query }).on('complete', function(stat) {
        deferred.resolve(stat.fields);
      });
    });
    return deferred.promise;
  }
});
