'use strict';

const axios = require('axios'),
          _ = require('lodash'),
          Q = require('q'),
    CartoDB = require('cartodb'),
     crypto = require('crypto'),
 Memoizable = require('./memoizable');

class Rest extends Memoizable {
  constructor ({ user = "cartodb", api_key }) {
    super()
    this.api_key = api_key;
    this.user = user;
    // A client for requests on NamedMap
    this.namedMaps = new CartoDB.Maps.Named({ user, api_key })
    // A rest client for most requests
    this.axios = axios.create({
      // Base URL is scoped to the current user
      baseURL: `https://${user}.carto.com/api/`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: user,
        password: api_key
      }
    });
  }
  get () {
    return this.axios.get(...arguments).then(r => r.data)
  }
  post () {
    return this.axios.post(...arguments).then(r => r.data)
  }
  delete () {
    return this.axios.delete(...arguments)
  }
  // Backward compatibility
  del () {
    return this.delete(...arguments)
  }
  findInfowindow (viz) {
    // Shortcut to know if a variable is defined
    const defined = v => typeof v !== 'undefined' && v;
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
  }
  buildParams (page, per_page) {
    return {
      page: Number(Math.max(page || 1, 1)),
      per_page: Number(Math.min(per_page || 10, 10))
    };
  }
  // Backward compatibility
  buildQuery () {
    return this.buildParams(...arguments)
  }
  // List of user's visualizations
  layers () {
    var params = this.buildParams.apply(this, arguments);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    params.type = 'derived';
    return this.get('/v1/viz/', { params })
  }
  // List of user's tables
  tables () {
    const params = this.buildParams(...arguments);
    return this.get('/v1/viz/', { params })
  }
  emitterAsPromise (emitter) {
    const q = Q.defer()
    emitter.on('done', q.resolve)
    emitter.on('_error', q.reject)
    return q.promise
  }
  createNamedMap (template) {
    return this.emitterAsPromise( this.namedMaps.create({ template }) )
  }
  deleteNamedMap (template_id) {
    return this.emitterAsPromise( this.namedMaps.delete({ template_id }) )
  }
  async deleteNamedMapIfExist (name) {
    try {
      return await this.deleteNamedMap(name)
    } catch {
      return null
    }
  }
  // Backward compatibility
  instanciate () {
    return this.instantiateNamedMap(...arguments)
  }
  instantiateNamedMap(template_id, params) {
    const emitter = this.namedMaps.instantiate({ template_id,  ...params })
    return this.emitterAsPromise(emitter)
  }
  // Get a single one visualization
  async viz (id, resolveNamedMap = true) {
    const params = this.buildParams();
    // Get the viz
    const viz = await this.get(`/v2/viz/${id}/viz.json`, { params })
    // Save date of importation as string
    const imported_at = this.importedAt()
    // Resolve named map by default
    resolveNamedMap = [false, 0].indexOf(resolveNamedMap) === -1;
    // We may resolve namedmaps
    if (resolveNamedMap && !_.find(viz.layers, { type: 'layergroup' }) ) {
      // Find a namedmap
      const namedMap = _.find(viz.layers, { type: 'namedmap' });
      // Add named map is given (private dataset)
      if(namedMap) {
        // Template name is used to retreive layergroup
        const tpl = namedMap.options.named_map.name;
        const params = this.buildParams();
        // Find the layergroup
        const named = await this.get(`/v1/map/named/${tpl}`, { params })
        // Create a layergroup
        const layer = {
          type: 'layergroup',
          // Duplicated namedMap options
          options: _.cloneDeep(namedMap.options)
        };
        // Add the layer definition to the options
        layer.options.layer_definition = _.get(named, 'template.layergroup', null);
        // Add it to the layer list
        viz.layers.push(layer);
      }
    }
    return { imported_at, ...viz }
  }
  // Gets a NamedMap
  named (name) {
    return this.get(`/v1/map/named/${name}`,  { params: this.buildParams() })
  }
  importedAt () {
    const date =  new Date().toLocaleString({ timeZone: 'UTC' })
    return `${date} UTC`
  }
  uniqueNamedMapId (id) {
    const hash = crypto.createHash("sha256").update(id).digest('hex');
    const now = ~~(Date.now()/1000);
    return ["dtpl", now, _.uniqueId(), hash].join('_');
  }
  // Backward compatibility
  projection () {
    return this.vizNewNamedMap(...arguments)
  }
  // Generate a NamedMap for the given viz
  async vizNewNamedMap (id, name, cartocss, sql, interactivity) {
    // Get the visualization
    const viz = await this.viz(id)
    // Find a layergroup
    const layergroup = _.find(viz.layers, { type: 'layergroup' });
    // Not layer definition
    if( ! layergroup.options.layer_definition ) {
      throw new Error("No layer found."); 
    }
    // Find the cartodb layer
    const cdbLayer = _.find(layergroup.options.layer_definition.layers, d => {
      // Sometime, cartodb is not written in lowercase
      return d.type.toLowerCase() === 'cartodb';
    });
    // Abort if no layer is found
    if( !cdbLayer ) {
      throw new Error("No layer found.");
    }
    // Use the named map as a fallback
    const namedMapTable = _.get(layergroup, 'options.named_map.layers.0.layer_name')
    sql = sql || cdbLayer.options.sql || `SELECT * FROM ${namedMapTable}`
    // Fill interactivity array with layer options if needed
    interactivity = interactivity || (cdbLayer.options.interactivity || '').split(',');
    // Complete interactivity array.
    // Look for an infowindow in the vizualisation.
    const iw = this.findInfowindow(viz);
    // Does the viz have an infowindow?
    if(iw !== null) {
      // So we extract infowindow field from the infowinfow
      interactivity = interactivity.concat( _.pluck(iw.fields, 'name') );
      interactivity = _.unique(interactivity);
    }
    // Build configuration
    const template = {
      "version": "0.0.1",
      "name": name || this.uniqueNamedMapId(viz.id),
      "auth": {
        "method": "open"
      },
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
    await this.deleteNamedMapIfExist(template.name)
    const { template_id } = await this.createNamedMap(template)
    return { named_map: template, template_id, viz };
  }
  basemapLayer () {
    return {
      type: 'http',
      options: {
        urlTemplate: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        subdomains: "1234"
      }
    }
  }
  // Get static map information for a given viz
  async static (id, noBasemap) {
    // Get the viz without resolving namedmap
    const viz = await this.viz(id, false)
    // Create a list of layers to show
    const layers = noBasemap ? [] : [ this.basemapLayer() ];
    const { template_id } = await this.vizNewNamedMap(id)
    // Instanciate a named map to gets its layergroupid
    const { layergroupid } = await this.instantiateNamedMap(template_id)
    // Add the mapnik to the list of layers
    layers.push({
      type: 'http',
      options: {
        // Build the ratserized map URL for the NamedMap instance
        urlTemplate: `https://${this.user}.carto.com/api/v1/map/${layergroupid}/{z}/{x}/{y}.png`
      }
    });
    // Get the static map attributes
    const result = await this.post('/v1/map/', { layers })
    // Stop if there is a problem
    if(!result.cdn_url || !result.cdn_url.http) {
      throw new Error('Unable to generate an image for this layer.');
    }
    // Add default cdn values
    result.cdn_url = result.cdn_url || {
      "http": "api.cartocdn.com",
      "https": "cartocdn.global.ssl.fastly.net"
    };
    // Returns an object with the details
    return {
      http  : result.cdn_url.http,
      https : result.cdn_url.https,
      user  : this.user,
      token : result.layergroupid,
      center: [ viz.zoom ].concat( JSON.parse(viz.center) ),
      bounds: [ viz.bounds[0][1], viz.bounds[0][0], viz.bounds[1][1], viz.bounds[1][0] ]
    }
  }
  // Search a layer by its name
  search (q, type, page, per_page) {
    var params = this.buildParams(page, per_page);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    params.type = type || 'derived';
    params.q    = q;
    return this.get('/v1/viz/', { params })
  }
  // Convert the given static informations into an image URL
  image (specs, width = 300, height =  170, protocol =  'https', format =  'png', useCenter = false) {
    // joins parameters
    return [
      protocol + '://' + specs[protocol],
      this.user,
      'api/v1/map/static',
      (useCenter ? 'center': 'bbox'),
      specs.token,
      (useCenter ? specs.center.join("/") : specs.bounds.join(",") ),
      width,
      height + '.' + format
    ].join("/")
  }
  // Get data for a given layer
  async data (id) {
    const params = this.buildParams();
    const q = await this.vizSqlQuery(id);
    return this.get('/v2/sql', { params: { q, ...params } })
  }
  async vizSqlQuery (id) {
    // Store sql from the layer
    let sql = null;
    // Get the visualization details
    const viz = await this.viz(id)
    const layergroupLayer = _.find(viz.layers, { type: 'layergroup' });
    const namedmapLayer = _.find(viz.layers, { type: 'namedmap' });
    // Attempt to find the query in the layer group SQL
    _.get(layergroupLayer, 'options.layer_definition.layers', []).forEach(layer => {
      sql = sql || this.fillParams(layer.options.sql)
    }, sql)
    // Attempt to find the table name in the viz title
    return sql || `SELECT * FROM ${viz.title.split(' ').shift()}`
  }
  fillParams (sql) {
    return _.template(sql)({ layer0: 1, layer1: 1, layer2: 1, layer3: 1 });
  }
  // Get layer's fields
  async fields(id) {
    // Build query parameters
    let params = this.buildParams();
    let sql = await this.vizSqlQuery(id);
    // Build the SQL query
    params.q = "select * from (" + sql + ") __wrapped limit 0";
    // Use rest api to extract table's field
    const { fields } = await this.get('/v2/sql', { params });
    // Returns only the fields list
    return fields
  }
}

module.exports = Rest
