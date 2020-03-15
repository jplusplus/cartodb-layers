'use strict';

const axios = require('axios'),
          _ = require('lodash'),
          Q = require('q'),
    CartoDB = require('cartodb'),
     crypto = require('crypto'),
  jsonQuery = require('json-query'),
 Memoizable = require('./memoizable');

 /** Class to communicate with CARTO Rest API  */
class Rest extends Memoizable {
  /**
   * Create a Rest instance
   * @param {Object} args - An object to configure the client with a "user" and "api_key" properties.
   * @param {String} [args.user=cartodb] - CARTO username
   * @param {String} args.api_key - CARTO api key
   */
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
  /**
   * Perform a GET request over CARTO API.
   * @param {Object} args - Spread parameters to `axios` method
   * @return {Promise}
   */
  get () {
    return this.axios.get(...arguments).then(r => r.data)
  }
  /**
   * Perform a POST request over CARTO API.
   * @param {Object} args - Spread parameters to `axios` method
   * @return {Promise}
   */
  post () {
    return this.axios.post(...arguments).then(r => r.data)
  }
  /**
   * Perform a DELETE request over CARTO API.
   * @param {Object} args - Spread parameters to `axios` method
   * @return {Promise}
   */
  delete () {
    return this.axios.delete(...arguments)
  }
  /**
   * Perform a DELETE request over CARTO API.
   * @param {Object} args - Spread parameters to `axios` method
   * @return {Promise}
   * @deprecated
   */
  del () {
    return this.delete(...arguments)
  }
  /**
   * Find an infowindow description object in the given vizualisation
   * @param {Object} viz - Vizualisation description object from CARTO API
   * @return {Object}
   */
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
  /**
   * Build query parameters to paginate results from CARTO
   * @param {Number} [page=1]
   * @param {Number} [per_page=10]
   * @return {Object}
   */
  buildParams (page, per_page) {
    return {
      page: Number(Math.max(page || 1, 1)),
      per_page: Number(Math.min(per_page || 10, 10))
    };
  }
  /**
   * Build query parameters to paginate results from CARTO
   * @param {Number} page
   * @param {Number} per_page
   * @return {Object}
   * @deprecated
   */
  buildQuery () {
    return this.buildParams(...arguments)
  }
  /**
   * Get all "layers" which is basicaly all user's vizualisations
   * @return {Array}
   * @deprecated
   */
  layers () {
    return this.getLayers(...arguments)
  }
  /**
   * Get all "layers" which is basicaly all user's vizualisations
   * @return {Array}
   */
  getLayers () {
    var params = this.buildParams.apply(this, arguments);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    params.type = 'derived';
    return this.get('/v1/viz/', { params })
  }
  /**
   * Get all user's tables
   * @return {Array}
   */
  tables () {
    const params = this.buildParams(...arguments);
    return this.get('/v1/viz/', { params })
  }
  /**
   * Cast the given event emmiter to a Promise
   * @param {Object} emitter
   * @return {Promise}
   */
  emitterAsPromise (emitter) {
    const q = Q.defer()
    emitter.on('done', q.resolve)
    emitter.on('_error', q.reject)
    return q.promise
  }
  /**
   * Create a named map based on the given template object
   * @param {Object} template
   * @return {Promise}
   */
  createNamedMap (template) {
    return this.emitterAsPromise( this.namedMaps.create({ template }) )
  }
  /**
   * Delete a named map
   * @param {String} template_id - Id of the template to delete
   * @return {Promise}
   */
  deleteNamedMap (template_id) {
    return this.emitterAsPromise( this.namedMaps.delete({ template_id }) )
  }
  /**
   * Delete a named map but return null without throwing an error if the named
   * map doesn't exist
   * @param {String} template_id - Id of the template to delete
   * @return {Promise}
   */
  async deleteNamedMapIfExist (template_id) {
    try {
      return await this.deleteNamedMap(template_id)
    } catch {
      return null
    }
  }
  /**
   * Create an instance of the given name map with custom params
   * @param {String} template_id - Id of the template
   * @param {Object} params - Params of the named map
   * @deprecated
   * @return {Promise}
   */
  instanciate () {
    return this.instantiateNamedMap(...arguments)
  }
  /**
   * Create an instance of the given name map with custom params
   * @param {String} template_id - Id of the template
   * @param {Object} params - Params of the named map
   * @return {Promise}
   */
  instantiateNamedMap(template_id, params = {}) {
    const emitter = this.namedMaps.instantiate({ template_id,  ...params })
    return this.emitterAsPromise(emitter)
  }
  /**
   * Get a vizualisation using CARTO API v2
   * @param {String} id - Id of the vizualisation
   * @param {Boolean} [resolveNamedMap=true] - Should add the vizualisation's named map
   * @deprecated
   * @return {Promise}
   */
  viz () {
    return this.getVizV2(...arguments)
  }
  /**
   * Get a vizualisation using CARTO API v2
   * @param {String} id - Id of the vizualisation
   * @param {Boolean} [resolveNamedMap=true] - Should add the vizualisation's named map
   * @return {Promise}
   */
  async getVizV2 (id, resolveNamedMap = true) {
    // Get the viz
    const viz = await this.get(`/v2/viz/${id}/viz.json`)
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
        // Find the layergroup
        const named = await this.get(`/v1/map/named/${tpl}`)
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
  /**
   * Get a vizualisation using CARTO API v1
   * @param {String} id - Id of the vizualisation
   * @return {Promise}
   */
  async getVizV1 (id) {
    // Get the viz
    return this.get(`/v1/viz/${id}`)
  }
  /**
   * Get a named map using CARTO API v1
   * @param {String} name - Name of the Named Map
   * @depracted
   * @return {Promise}
   */
  named () {
    return this.getNamedMap(...arguments)
  }
  /**
   * Get a named map using CARTO API v1
   * @param {String} name - Name of the Named Map
   * @return {Promise}
   */
  getNamedMap (name) {
    return this.get(`/v1/map/named/${name}`)
  }
  /**
   * Get all named maps using CARTO API v1
   * @return {Promise}
   */
  getNamedMaps () {
    return this.get(`/v1/map/named`)
  }
  /**
   * Get the current date as a locale string in UTC timezone
   * @return {String}
   */
  importedAt () {
    const date =  new Date().toLocaleString({ timeZone: 'UTC' })
    return `${date} UTC`
  }
  /**
   * Get a unique named map id based on the date
   * @param {String} id - Named Map name (or id)
   * @param {String} [prefix="dtpl"] - Prefix to all namedMap ids
   * @return {String}
   */
  uniqueNamedMapId (id, prefix = "dtpl") {
    const hash = crypto.createHash("sha256").update(id).digest('hex');
    const now = ~~(Date.now()/1000);
    return [prefix, now, _.uniqueId(), hash].join('_');
  }
  /**
   * Instanciate a new Named Map with a custom CartoCSS and SQL projection
   * @param {String} id - Named Map name (or id)
   * @param {String} name - Name of the new named map
   * @param {String} cartocss - Custom CartoCSS
   * @param {String} sql - Custom SQL
   * @param {String} interactivity - A commat separated list of fields the user can interact with
   * @return {Promise}
   * @depracted
   */
  projection () {
    return this.vizNewNamedMap(...arguments)
  }
  /**
   * Instanciate a new Named Map with a custom CartoCSS and SQL projection
   * @param {String} id - Named Map name (or id)
   * @param {String} name - Name of the new named map
   * @param {String} cartocss - Custom CartoCSS
   * @param {String} sql - Custom SQL
   * @param {String} interactivity - A commat separated list of fields the user can interact with
   * @return {Promise}
   */
  async vizNewNamedMap (id, name, cartocss, sql, interactivity) {
    // Get the visualization
    const viz = await this.viz(id)
    // Find the cartodb layer
    const cdbLayer = _.chain([
      Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers[*type=cartodb]'),
      Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers[*type=CartoDB]'),
    ]).compact().first().value()
    // Abort if no layer is found
    if( !cdbLayer ) {
      throw new Error("No layer found.");
    }
    // We might need to load the SQL for this named map
    sql = sql || await this.vizSqlQuery(id)
    // Fill interactivity array with layer options if needed
    interactivity = interactivity || (cdbLayer.options.interactivity || '').split(',');
    // Complete interactivity array.
    // Look for an infowindow in the vizualisation.
    const iw = this.findInfowindow(viz);
    // Does the viz have an infowindow?
    if(iw !== null) {
      // So we extract infowindow field from the infowinfow
      interactivity = interactivity.concat( _.map(iw.fields, 'name') );
      interactivity = _.uniq(interactivity);
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
  /**
   * Get the default basemap layer definition
   * @return {Object}
   */
  basemapLayer () {
    return {
      type: 'http',
      options: {
        urlTemplate: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        subdomains: "1234"
      }
    }
  }
  /**
   * Get the static definition (image) of a given vizualisation
   * @param {String} id - Vizualisation id
   * @param {Boolean} noBasemap - Disabled the basemap layer in the static visualization
   * @return {Object}
   */
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
  /**
   * Search a visualization by its name
   * @param q - Query string
   * @param [type=derived] - Type of vizualisation to look for
   * @param page - Page number
   * @param per_page - Number of visualizations by page
   *
   */
  search (q, type, page, per_page) {
    var params = this.buildParams(page, per_page);
    // The viz endpoint must be filtered by type 'derived' to
    // display only vizualisations (that we call 'layers').
    params.type = type || 'derived';
    params.q    = q;
    return this.get('/v1/viz/', { params })
  }
  /**
   * Convert the given static definition into an image URL
   * @param specs - Static definition
   * @param [width=300] - Image width
   * @param [height=170] - Image height
   * @param [protocol=https] - URL protocol
   * @param [format=png] - Image format
   * @param [useCenter=false] - The given definition uses center instead of boundaries to pane the map.
   * @return {String} Image URL
   */
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
  /**
   * Get data for a given vizualisation using API v2
   * @param {String} id - Id of the vizualisation
   * @return {Promise}
   */
  async data (id) {
    const params = this.buildParams();
    const q = await this.vizSqlQuery(id);
    return this.get('/v2/sql', { params: { q, ...params } })
  }
  /**
   * Get SQL query of a given vizualisation
   * @param {String} id - Id of the vizualisation
   * @return {Promise} SQL query as string
   */
  async vizSqlQuery (id) {
    // Get the visualization details
    const viz = await this.throttled(1000).getVizV2(id)
    // Store sql from the layer
    const table_name = await this.throttled(1000).vizTable(id)
    const sql = `SELECT * FROM "${table_name}"`
    return this.fillParams(sql) || sql
  }
  /**
   * Get related table of a given vizualisation using API v1
   * @param {String} id - Id of the vizualisation
   * @return {Promise} A list of related tables
   */
  async vizRelatedTables (id) {
    // Get the visualization details using API v1
    const { related_tables } = await this.throttled(1000).getVizV1(id)
    return related_tables
  }
  /**
   * Get the name of table used by a given vizualisation
   * @param {String} id - Id of the vizualisation
   * @return {String} Table name
   */
  async vizTable (id) {
    // Get the visualization details
    const viz = await this.throttled(1000).getVizV2(id)
    // Try each one of the follow method
    return Rest.firstNonNul([
      // Attempt to get the name using the SQL request
      async () => {
        const sql = Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers.options.sql', null)
        // Extract the table from the query
        return sql ? Rest.sqlQueryToTable(sql) : null;
      },
      // Use layergroup get the table name
      async () => {
        return Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers.options.table_name', null)
      },
      // Alternativly, we might use the related table
      async () => {
        const related_tables = await this.throttled(1000).vizRelatedTables(id)
        return _.first( _.map(related_tables, 'name') )
      },
      // Use named map to get the table name
      async () => {
        return Rest.queryCollection(viz, 'layers[*type=namedmap].options.named_map.layers.layer_name', null)
      }
    ])
  }
  /**
   * Fills default parameters for a given SQL query template
   * @param {String} sql - SQL query template
   * @return {String} SQL query
   */
  fillParams (sql) {
    return _.template(sql)({ layer0: 1, layer1: 1, layer2: 1, layer3: 1 });
  }
  /**
   *  Get fields (table rows) for a given vizualization using API v2
   * @param {String} id - Id of the vizualisation
   * @return {Array}
   */
  async fields(id) {
    // Build query parameters
    let params = this.buildParams();
    let table_name = await this.throttled(1000).vizTable(id);
    // Build the SQL query
    params.q = `SELECT * FROM "${table_name}" LIMIT 0`;
    // Use rest api to extract table's field
    const { fields } = await this.get('/v2/sql', { params });
    // Returns only the fields list
    return fields
  }
  /**
   * Evaluate the given list of promises in series, then stops and return the
   * first non null value.
   * @static
   * @param {Array} tasks - List of promises
   * @return {Mixed} First non null value
   */
  static async firstNonNul (tasks = []) {
    let value = null
    for await (let task of tasks) {
      value = await task()
      if (value !== null && value !== undefined) break;
    }
    return value
  }
  /**
   * Return the value of the given `path` in the `data object`
   * @static
   * @param {Object} data - Object to look into
   * @param {String} path - Path to use
   * @param {Mixed} force - Specify an object to be returned from the query if the query fails.
   * @return {Mixed}
   */
  static queryCollection (data, path, force) {
    const { value } = jsonQuery(path, { data, force })
    return _.first(_.castArray(value))
  }
  /**
   * Get the table from a given SQL query
   * @param {String} sql - SQL query
   * @return {String} Table name from the query (or null if any)
   */
  static sqlQueryToTable (sql) {
    const token = /SELECT\s+.+\s+FROM\s+(".+"\.)?(\w+)(\s+WHERE.+)?/i
    if (sql && token.test(sql)) {
      return _.trim(sql.replace(token, '$2'), " \"'`")
    }
    return null
  }
}

module.exports = Rest
