'use strict';

var    assert = require('assert'),
CartodbLayers = require('../'),
          tv4 = require('tv4'),
       secret = require('./secret'),
      request = require('request-promise');

describe('Carto REST client', function () {
  // CartoDB might be slow sometime...
  this.timeout(40000);
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema for visualizations list
  var visualizationsSchema = require("./schemas/visualizations.json"),
  // Validation schema for a single visualization
                 vizSchema = require("./schemas/viz.json"),
  // Validation schema for a sql result
                 sqlSchema = require("./schemas/sql.json");


  it('must get layer\'s fields', function () {
    // Get layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      return cl.rest.fields(id).then(function(fields) {
        // Every table contains a column "the_geom"
        assert(fields.the_geom, 'No column extracted.');
      });
    });

  });

  it('must reach per-user CartoDB REST API', function () {
    return cl.rest.get("v1/viz/?per_page=1").on('complete', function(result) {
      // Result must not be be an instance of error
      assert(!(result instanceof Error));
    });
  });

  it('must build request\'s query', function () {
    // Pass a page and a number of visualization by page
    var query = cl.rest.buildQuery(3, 9);
    assert(query.page === 3, 'The query\'s page is wrong.');
    assert(query.per_page === 9, 'The number of item per page is wrong.');
    // Every request must use an API_KEY
    assert(query.api_key === secret.API_KEY, 'The api key is wrong.');
  });


  it('must not allow negative page', function () {
    var query = cl.rest.buildQuery(-40);
    assert(query.page === 1);
  });

  it('must not allow more than 10 visualization per page', function () {
    var query = cl.rest.buildQuery(1, 12);
    assert(query.per_page === 10);
  });

  it('must fetch layers', function () {
    // Get layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // Use json schema validator
      assert( tv4.validate(result, visualizationsSchema),  !tv4.error || tv4.error.message );
    });
  });

  it('must fetch one vizualisation\'s details', function () {
    // Get one layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      // Get the viz
      return cl.rest.viz(id).then(function(result) {
        // Use json schema validator
        assert( tv4.validate(result, vizSchema),  !tv4.error || tv4.error.message );
      });

    });
  });

  it('must fetch one vizualisation\'s image', function () {
    // Get one layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      // Get the viz
      return cl.rest.static(id).then(function(config) {
        return request( cl.rest.image(config) ).then(function(response) {
          assert(response.statusCode, 200);
          assert(response.headers['content-type'], 'image/png');
        });
      });
    });
  });

  it('must fetch one vizualisation\'s image with no basemap', function () {
    // Get one layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      // Get the viz
      return cl.rest.static(id, true).then(function(config) {
        return request( cl.rest.image(config) ).then(function(response) {
          assert(response.statusCode, 200);
          assert(response.headers['content-type'], 'image/png');
        });
      });
    });
  });

  it('must fetch one vizualisation\'s image with no basemap and a center', function () {
    // Get one layer from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      // Get the viz
      return cl.rest.static(id, true).then(function(config) {
        var url = cl.rest.image(config, 300, 170, 'http', 'png', true);
        request(url).then(function(response) {
          assert(response.statusCode, 200);
          assert(response.headers['content-type'], 'image/png');
        });
      });
    });
  });

  it('must fetch tables', function () {
    // Get tables from page 1
    cl.rest.tables(1,1).then(function(result) {
      // Use json schema validator
      assert( tv4.validate(result, visualizationsSchema),  !tv4.error || tv4.error.message );
    });
  });


  it('must fetch data for a given layer', function () {
    // Get tables from page 1
    return cl.rest.layers(1,1).then(function(result) {
      // We must have at least 1 layers
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layers.');
      // Save the id of the first visualization for later
      var id = result.visualizations[0].id;
      // Get the viz
      return cl.rest.data(id).then(function(result) {
        // Use json schema validator
        assert( tv4.validate(result, sqlSchema),  !tv4.error || tv4.error.message );
      });
    });
  });


  it('must search a layer using its name', function () {
    // Get tables from page 1
    return cl.rest.search("land").then(function(result) {
      // Use json schema validator
      assert( tv4.validate(result, visualizationsSchema),  !tv4.error || tv4.error.message );
    });
  });

  it('must fetch layers from page 2', function () {
    // Get 1 layer from page 1
    return cl.rest.layers(1, 1).then(function(result) {
      // We must have at least 2 visualizations
      assert(result.total_entries >= 2, 'Unable to perform the test with less than 2 visualizations.');
      // Save the id of the first visualization for later
      var first_id = result.visualizations[0].id;
      // To be sure that there is a second page, we ask less than
      // total number of entries per_page
      return cl.rest.layers(2, ~~(result.total_entries/2) ).then(function() {
        // The API must return at least one visualization
        assert(result.visualizations.length > 0, 'Second page must contain layers.');
        // The first visualization of the second page must be different
        // from the one in the first page
        assert(first_id !== result.visualizations[0].id, 'The second page contains the same layers than the first one.');
      });
    });
  });
});
