'use strict';

var rest = require('restler'),
       _ = require('lodash'),
       Q = require('q'),
  crypto = require('crypto');

// create a service constructor
// for very easy API wrappers on

module.exports = function(config) {
  const baseURL = "https://" + config.user + ".carto.com/api/";
  // Create a service with Restler
  const Service = rest.service(function() {
    this.defaults.api_key = config.api_key;
    this.defaults.user = config.user || "cartodb";
  }, { baseURL}, {
    findInfowindow: function(viz) {
      // Shortcut to know if a variable is defined
      var defined = function(v) {
        return typeof v !== 'undefined' && v;
      };
      // Does it have an infowindow attribute?
      if( defined(viz.infowindow) ) {
        return viz.infowindow;
      // Does it contains several layers?*
      } else if( defined(viz.layers) ) {
        // Look each layer one by one
        for(var i in viz.layers) {
          // Look for an infowindow in the layer
          var iw = this.findInfowindow(viz.layers[i]);
          // Does the layer contains an infowindow?
          if( defined(iw) ) {
            // If yes, we stop here and return it
            return iw;
          }
        }
      }
      // The layers list may not be containing any infowindow.
      // We check the viz options to find a named_map.
      if( defined(viz.options) && defined(viz.options.named_map)) {
        // Look for an infowindow into the named_map
        return this.findInfowindow(viz.options.named_map);
      } else {
        return null;
      }
    },
    buildQuery: function(page, per_page) {
      return {
        page: Number(Math.max(page || 1, 1)),
        per_page: Number(Math.min(per_page || 10, 10)),
        // To allow type filtering we must add an API Key to the request
        api_key: config.api_key
      };
    },
    // List of user's visualizations
    layers: function() {
      var query = this.buildQuery.apply(this, arguments);
      var deferred = Q.defer();
      // The viz endpoint must be filtered by type 'derived' to
      // display only vizualisations (that we call 'layers').
      query.type = 'derived';
      this.get('v1/viz/', { query }).on("complete", deferred.resolve);
      return deferred.promise;
    },
    // List of user's tables
    tables: function() {
      var query = this.buildQuery.apply(this, arguments);
      var deferred = Q.defer();
      query.type = 'table';
      this.get('v1/viz/', { query }).on("complete", deferred.resolve);
      return deferred.promise;
    },
    // Get a single one visualization
    viz: function(id, resolveNamedMap) {
      var query = this.buildQuery();
      var deferred = Q.defer();
      // Resolve named map by default
      resolveNamedMap = [false, 0].indexOf(resolveNamedMap) === -1;
      // Get the viz
      this.get('v2/viz/' + id + '/viz.json', { query }).on('complete', (viz) => {
        // We may resolve namedmaps
        if (resolveNamedMap && !_.find(viz.layers, { type: 'layergroup' }) ) {
          // Find a namedmap
          var namedmap = _.find(viz.layers, { type: 'namedmap' });
          // Add namedmap is given (private dataset)
          if( namedmap ) {
            // Template name is used to retreive layergroup
            var tpl = namedmap.options.named_map.name;
            var query = this.buildQuery();
            // Find the layergroup
            this.get('v1/map/named/' + tpl, { query }).on('complete', (named) => {
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
        // Just send the viz
        } else {
          deferred.resolve(viz);
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
    projection: function(id, name, cartocss, sql, interactivity) {
      var deferred = Q.defer();
      // Create a hash for the viz id
      var hash = crypto.createHash("sha256").update(id).digest('hex');
      // Timestamp token
      var now = ~~(Date.now()/1000);
      // Default name uses viz id
      name = name || ("tpl_" + now + '_' + hash);
      // Get the visualization
      this.viz(id).then( viz => {
        const query = this.buildQuery();
        // Find a layergroup
        const layergroup = _.find(viz.layers, { type: 'layergroup' });
        // Not layer definition
        if( ! layergroup.options.layer_definition ) { return deferred.reject("No layer found."); }
        // Find the cartodb layer
        const cdbLayer = _.find(layergroup.options.layer_definition.layers, d => {
          // Sometime, cartodb is not written in lowercase
          return d.type.toLowerCase() === 'cartodb';
        });
        // Abort if no layer is found
        if( !cdbLayer ) {
          return deferred.reject("No layer found.");
        }
        // Use the named map as a fallback
        const namedMapTable = _.get(layergroup, 'options.named_map.layers.0.layer_name')
        sql = sql || cdbLayer.options.sql || `SELECT * FROM ${namedMapTable}`
        // Fill interactivity array with layer options if needed
        interactivity = interactivity || (cdbLayer.options.interactivity || '').split(',');
        // Complete interactivity array.
        // Look for an infowindow in the vizualisation.
        var iw = this.findInfowindow(viz);
        // Does the viz have an infowindow?
        if(iw !== null) {
          // So we extract infowindow field from the infowinfow
          interactivity = interactivity.concat( _.pluck(iw.fields, 'name') );
          interactivity = _.unique(interactivity);
        }
        // Build configuration
        var mapconfig = {
          "version": "0.0.1",
          "name": name,
          "auth": {"method": "open"},
          "placeholders": {
            "layer0": {
              "type": "number",
              "default": 1
            },
            "layer1": {
              "type": "number",
              "default": 1
            },
            "layer2": {
              "type": "number",
              "default": 1
            },
            "layer3": {
              "type": "number",
              "default": 1
            }
          },
          "layergroup": {
            "layers": [{
              "type": "cartodb",
              "options": {
                "cartocss_version": "2.1.1",
                "cartocss": cartocss || cdbLayer.options.cartocss,
                "sql": sql,
                "interactivity": interactivity.join(',')
              }
            }]
          }
        };
        // Remove existing projection first
        this.del('v1/map/named/' + name, { query }).on('complete', () => {
          // Get the visualization details
          this.post('v1/map/named', {
            query,
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify(mapconfig)
          }).on('complete', () => {
            deferred.resolve({ named_map: mapconfig, viz });
          }).on('error', deferred.reject);
        }).on('error', deferred.reject);
      }, deferred.reject).fail(deferred.reject);
      // Returns the event emitter
      // which is resolved after a few requests
      return deferred.promise;
    },
    // Get static map information for a given viz
    static: function(id, noBasemap) {
      var deferred = Q.defer();
      // Isolate current Rest instance
      var that = this;
      // Get the viz without resolving namedmap
      that.viz(id, false).then(function(viz) {
        return Q.all([
          // Get layers
          Q.Promise(function(resolve) {
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
            // Resolve layer array
            resolve(layers);
          }),
          // Get template name
          Q.Promise(function(resolve) {
            // This viz may contain a namedmap
            var namedmap = _.find(viz.layers, { type: 'namedmap' });
            // If a named exist, we don't need to create one
            if( namedmap ) {
              resolve(namedmap.options.named_map);
              // No namedmap? We create one!
            } else {
              that.projection(id).then(function(projection) {
                resolve(projection.named_map);
              }).fail(deferred.reject);
            }
          })
        ]).spread(function(layers, named_map) {
          // Instanciate a named map to gets its layergroupid
          that.instanciate(named_map.name).then(function(instance) {
            // Add the mapnik to the list of layers
            layers.push({
              type: 'http',
              options: {
                // Build the ratserized map URL for the NamedMap instance
                urlTemplate: 'http://' + that.user + '.cartodb.com/api/v1/map/' + instance.layergroupid + '/{z}/{x}/{y}.png'
              }
            });
            // Get the static map attributes
            that.json('POST', 'v1/map/', { layers: layers }).on('complete', function(result) {
              // Stop if there is a problem
              if(!result.cdn_url || !result.cdn_url.http) {
                return deferred.reject('Unable to generate an image for this layer.');
              }
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
                token : result.layergroupid,
                center: [ viz.zoom ].concat( JSON.parse(viz.center) ),
                bounds: [ viz.bounds[0][1], viz.bounds[0][0], viz.bounds[1][1], viz.bounds[1][0] ]
              });
            }).on("error", deferred.reject);
          });
        });
      }).fail(deferred.reject);
      // Returns the event emitter
      // which is resolved after a few requests
      return deferred.promise;
    },
    // Search a layer by its name
    search: function(q, type, page, per_page) {
      var deferred = Q.defer();
      var query = this.buildQuery(this, [page, per_page]);
      // The viz endpoint must be filtered by type 'derived' to
      // display only vizualisations (that we call 'layers').
      query.type = type || 'derived';
      query.q    = q;
      this.get('v1/viz/', { query }).on('complete', deferred.resolve);
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
      // Get the visualization details
      this.viz(id).then(viz => {
        // Store sql from the layer
        var sql = null;
        // Find the sql id
        var layergroup = _.find(viz.layers, { type: 'layergroup' });
        // A layergroup exists
        if(layergroup && layergroup.options.layer_definition) {
          // For each layer inside the layer definition
          (layergroup.options.layer_definition.layers || []).forEach(layer => {
            sql = layer.options.sql;
          });
          // We found the sql name
          if(sql !== null) {
            var query = this.buildQuery();
            // Build the SQL query
            query.q = this.fillParams(sql);
            // Use rest api to extract table's field
            this.get('v2/sql', { query })
              // Resolve the promise
              .on('complete', deferred.resolve)
              // Reject the promise
              .on('error', deferred.reject);
          } else {
            // Emit an error
            deferred.reject("The layer has no data.");
          }
        } else {
          // Emit an error
          deferred.reject("The layer enumerates no data layer.");
        }
      }).fail(deferred.reject);

      return deferred.promise;
    },
    fillParams: function(sql) {
      return _.template(sql)({ layer0: 1, layer1: 1, layer2: 1, layer3: 1 });
    },
    // Get layer's fields
    fields: function(id) {
      var deferred = Q.defer();
      // Get the visualization details
      this.projection(id).then( projection => {
        var sql = null;
        var query = this.buildQuery();
        // Get the layer's SQL
        projection.named_map.layergroup.layers.forEach(layer => {
          sql = this.fillParams(layer.options.sql);
        });
        // No SQL avalaible
        if(!sql) {
          return deferred.reject("The layer has no data.");
        }
        // Build the SQL query
        query.q = "select * from (" + sql + ") __wrapped limit 0";
        // Use rest api to extract table's field
        this.get('v2/sql', { query }).on('complete', stat => {
          deferred.resolve(stat.fields);
        });
      }, deferred.reject).fail(deferred.reject);
      return deferred.promise;
    }
  });

  return new Service();
};
