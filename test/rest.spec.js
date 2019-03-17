const CartodbLayers = require('../'),
                tv4 = require('tv4'),
             secret = require('./secret'),
              axios = require('axios');

describe('Carto REST client', function () {
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema for visualizations list
  var visualizationsSchema = require("./schemas/visualizations.json"),
  // Validation schema for a single visualization
                 vizSchema = require("./schemas/viz.json"),
  // Validation schema for a sql result
                 sqlSchema = require("./schemas/sql.json");

  // CARTO might be slow sometime...
  jest.setTimeout(40000)

  it('must get layer\'s fields', async function () {
    // Get layer from page 1
    const layers = await cl.rest.layers(1,1)
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    const fields = await cl.rest.fields(layers.visualizations[0].id)
    // Every table contains a column "the_geom"
    expect(fields.the_geom).toBeTruthy();
  });

  it('must reach per-user Carto REST API', function () {
    return cl.rest.get("v1/viz/?per_page=1").then(result => {
      // Result must not be be an instance of error
      expect(result instanceof Error).toBeFalsy();
    });
  });

  it('must build request\'s query', function () {
    // Pass a page and a number of visualization by page
    var query = cl.rest.buildQuery(3, 9);
    // The query's page is wrong.
    expect(query.page).toBe(3);
    // The number of item per page is wrong.
    expect(query.per_page).toBe(9);
  });


  it('must not allow negative page', function () {
    var query = cl.rest.buildParams(-40);
    expect(query.page).toBe(1);
  });

  it('must not allow more than 10 visualization per page', function () {
    var query = cl.rest.buildParams(1, 12);
    expect(query.per_page).toBe(10);
  });

  it('must fetch layers', function () {
    // Get layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // Use json schema validator
      expect( tv4.validate(result, visualizationsSchema) ).toBeTruthy();
    });
  });

  it('must fetch one vizualisation\'s details',  async function () {
    // Get one layer from page 1
    const layers = await cl.rest.layers(1,1);
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    const id = layers.visualizations[0].id;
    // Get the viz
    const viz = await cl.rest.viz(id);
    // Use json schema validator
    expect( tv4.validate(viz, vizSchema) ).toBeTruthy();
  });

  it('must fetch one vizualisation\'s image', async function () {
    // Get one layer from page 1
    const layers = await cl.rest.layers(1,1);
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    const id = layers.visualizations[0].id;
    // Get the static
    const config = await cl.rest.static(id);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch one vizualisation\'s image with no basemap',  async function () {
    // Get one layer from page 1
    const layers = await cl.rest.layers(1,1);
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    const id = layers.visualizations[0].id;
    // Get the static
    const config = await cl.rest.static(id, true);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch one vizualisation\'s image with no basemap and a center', async function () {
    // Get one layer from page 1
    const layers = await cl.rest.layers(1,1);
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    const id = layers.visualizations[0].id;
    // Get the static
    const config = await cl.rest.static(id, true)
    const url = cl.rest.image(config, 300, 170, 'http', 'png', true);
    const response = await axios.get(url)
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch tables', function () {
    // Get tables from page 1
    cl.rest.tables(1,1).then(function(result) {
      // Use json schema validator
      expect( tv4.validate(result, visualizationsSchema) ).toBeTruthy();
    });
  });

  it('must fetch data for a given layer', async function () {
    // Get tables from page 1
    const layers = await cl.rest.layers(1,1)
    // We must have at least 1 layers
    expect(layers.total_entries).not.toBe(0);
    // Save the id of the first visualization for later
    var id = layers.visualizations[0].id;
    // Get the viz
    const result = await cl.rest.data(id)
    // Use json schema validator
    expect( tv4.validate(result, sqlSchema) ).toBeTruthy();
  });

  it('must search a layer using its name', async function () {
    // Get tables from page 1
    const result = await cl.rest.search("land")
    // Use json schema validator
    expect( tv4.validate(result, visualizationsSchema) ).toBeTruthy();
  });

  it('must fetch layers from page 2', function () {
    // Get 1 layer from page 1
    return cl.rest.layers(1, 1).then(function(result) {
      // We must have at least 2 visualizations
      expect(result.total_entries).not.toBeLessThan(2);
      // Save the id of the first visualization for later
      var first_id = result.visualizations[0].id;
      // To be sure that there is a second page, we ask less than
      // total number of entries per_page
      return cl.rest.layers(2, ~~(result.total_entries/2) ).then(result => {
        // The API must return at least one visualization
        expect(result.visualizations.length).not.toBe(0);
        // The first visualization of the second page must be different
        // from the one in the first page
        expect(result.visualizations[0].id).not.toBe(first_id);
      });
    });
  });
});
