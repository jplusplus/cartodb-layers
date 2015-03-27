'use strict';

var    assert = require('assert'),
CartodbLayers = require('../'),
          tv4 = require('tv4'),
       secret = require('./secret');

describe('CartoDB REST client', function () {
  // CartoDB might be slow sometime...
  this.timeout(10000);
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema
  var schema = require("./schemas/viz.json");

  it('must reach per-user CartoDB REST API', function (done) {
    cl.rest.get("v1/viz/?per_page=1").on("complete", function(result) {
      // Result must not be be an instance of error
      assert(!(result instanceof Error));
      done();
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

  it('must fetch layers', function (done) {
    // Get layer from page 1
    cl.rest.layers(1,1).on("complete", function(result) {
      // Use json schema validator
      assert( tv4.validate(result, schema),  !tv4.error || tv4.error.message );
      done();
    });
  });

  it('must fetch tables', function (done) {
    // Get tables from page 1
    cl.rest.tables(1,1).on("complete", function(result) {
      // Use json schema validator
      assert( tv4.validate(result, schema),  !tv4.error || tv4.error.message );
      done();
    });
  });

  it('must fetch layers from page 2', function (done) {
    // Get 1 layer from page 1
    cl.rest.layers(1, 1).on("complete", function(result) {
      // We must have at least 2 visualizations
      assert(result.total_entries >= 2, 'Unable to perform the test with less than 2 visualizations.');
      // Save the id of the first visualization for later
      var first_id = result.visualizations[0].id;
      // To be sure that there is a second page, we ask less than
      // total number of entries per_page
      cl.rest.layers(2, ~~(result.total_entries/2) ).on("complete", function(result) {
        // The API must return at least one visualization
        assert(result.visualizations.length > 0, 'Second page must contain layers.');
        // The first visualization of the second page must be different
        // from the one in the first page
        assert(first_id !== result.visualizations[0].id, 'The second page contains the same layers than the first one.');
        done();
      });

    });
  });

});
