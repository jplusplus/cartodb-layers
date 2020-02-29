const CartodbLayers = require('../'),
                tv4 = require('tv4'),
             secret = require('./secret'),
              axios = require('axios'),
             sample = require('lodash/sample'),
               Rest = require('../lib/rest');

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

  async function getRandomVizId () {
    const { visualizations } = await cl.rest.memoized.layers(5, 1);
    return sample(visualizations).id;
  }

  async function getRandomViz () {
    return cl.rest.memoized.viz(await getRandomVizId())
  }

  it('must get layer\'s fields', async function () {
    // Save the id of the first visualization for later
    const fields = await cl.rest.fields(await getRandomVizId())
    // Every table contains a column "the_geom"
    expect(fields.the_geom).toBeTruthy();
  });

  it('must reach per-user Carto REST API', async function () {
    const result = await cl.rest.get("v1/viz/?per_page=1")
    // Result must not be be an instance of error
    expect(result instanceof Error).toBeFalsy();
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

  it('must fetch layers', async function () {
    // Get layer from page 1
    const result = await cl.rest.layers(1,1)
    // Use json schema validator
    expect( tv4.validate(result, visualizationsSchema) ).toBeTruthy();
  });

  it('must fetch one vizualisation\'s details',  async function () {
    // Get the viz
    const viz = await getRandomViz();
    // Use json schema validator
    expect( tv4.validate(viz, vizSchema) ).toBeTruthy();
  });

  it('must fetch one vizualisation\'s details with an `imported_at` attribute',  async function () {
    // Get the viz
    expect(await getRandomViz()).toHaveProperty('imported_at');
  });

  it('must fetch one vizualisation\'s image', async function () {
    // Get the static
    const id = await getRandomVizId();
    const config = await cl.rest.static(id);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch one vizualisation\'s image with pictograms', async function() {
    const id = 'fec13603-c70a-456e-8716-442d5f69c557';
    const config = await cl.rest.static(id);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  })

  it('must fetch one vizualisation\'s image with geometry', async function() {
    const id = '6c3af479-5e76-4585-932b-b3935ad6a170';
    const config = await cl.rest.static(id);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  })

  it('must fetch one vizualisation\'s image with no basemap',  async function () {
    // Get the static
    const id = await getRandomVizId();
    const config = await cl.rest.static(id, true);
    const url = cl.rest.image(config);
    const response = await axios.get(url);
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch one vizualisation\'s image with no basemap and a center', async function () {
    // Get the static
    const id = await getRandomVizId();
    const config = await cl.rest.static(id, true)
    const url = cl.rest.image(config, 300, 170, 'http', 'png', true);
    const response = await axios.get(url)
    // Checks the image is correct
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('must fetch tables', async function () {
    // Get tables from page 1
    const result = await cl.rest.tables(1,1)
    // Use json schema validator
    expect( tv4.validate(result, visualizationsSchema) ).toBeTruthy();
  });

  it('must fetch data for a given layer', async function () {
    // Get the viz
    const id = await getRandomVizId();
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

  it('must fetch layers from page 2', async function () {
    var id = await getRandomVizId();
    // total number of entries per_page
    const { total_entries } = await cl.rest.layers()
    const result = await cl.rest.layers(2, ~~(total_entries/2) )
    // The API must return at least one visualization
    expect(result.visualizations.length).not.toBe(0);
    // The first visualization of the second page must be different
    // from the one in the first page
    expect(result.visualizations[0].id).not.toBe(id);
  });

  it('must extract the table name from an SQL query', function() {
    expect(Rest.sqlQueryToTable('select * from erde_klima')).toBe('erde_klima')
    expect(Rest.sqlQueryToTable('select * from erde_klima where true = true')).toBe('erde_klima')
    expect(Rest.sqlQueryToTable('SELECT * FROM erde_klima')).toBe('erde_klima')
  })

  it('must extract table name from a SQL with database prefix', async function() {
    const sql = 'SELECT * FROM "bsv-westermann".export_output_3'
    const table = Rest.sqlQueryToTable(sql)
    expect(table).toBe('export_output_3');
  })

  it('must find the values using the a json-query', async function () {
    const viz = {
      layers: [
        {
          type: 'somethnig',
          wrong: []
        },
        {
          type: "namedmap",
          options: { 
            named_map: {
              layers: [
                {
                  layer_name: "table"
                }
              ]
            }
          }
        },
        {
          type: 'layergroup',
          options: {
            layer_definition: {
              layers: [
                {
                  foo: 'bar',
                  options: {
                    barr: 'foo'
                  }
                },
                {
                  options: {
                    table_name: 'table',
                    sql: 'SELECT * FROM table'
                  }
                }
              ]
            }
          }
        }
      ]
    }
    const sql = Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers.options.sql')
    expect(sql).toBe('SELECT * FROM table')
    const tableFromLayergroup = Rest.queryCollection(viz, 'layers[*type=layergroup].options.layer_definition.layers.options.table_name')
    expect(tableFromLayergroup).toBe('table')
    const tableFromNamedMap = Rest.queryCollection(viz, 'layers[*type=namedmap].options.named_map.layers.layer_name')
    expect(tableFromNamedMap).toBe('table')
  })
});
