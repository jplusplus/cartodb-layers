'use strict';

var    assert = require('assert'),
       secret = require('./secret'),
          tv4 = require('tv4'),
CartodbLayers = require('../');

describe('CartoDB SQL projection', function () {
  // CartoDB might be slow sometime...
  this.timeout(20000);
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema
  var schema = require("./schemas/sql.json");

  it('must filter a layer using SQL', function (done) {

    cl.rest.tables(1,1).on("complete", function(result) {
      // We must have at least 1 layer
      assert(result.total_entries >= 1, 'Unable to perform the test with less than 1 layer.');

      var table = result.visualizations[0].name;

      cl.client.query('SELECT * FROM {table}', { table: table }, function(err, data) {
        // Use json schema validator
        assert( tv4.validate(data, schema),  !tv4.error || tv4.error.message );
        done();
      });

    });

  });

  cl.connect();

});
