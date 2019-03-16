'use strict';

var    secret = require('./secret'),
          tv4 = require('tv4'),
CartodbLayers = require('../');

describe('Carto SQL projection', function () {
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema
  var schema = require("./schemas/sql.json");

  it('must filter a layer using SQL', function (done) {

    cl.rest.tables(1,1).then(function(result) {
      // We must have at least 1 layer
      expect(result.total_entries >= 1).toBeTruthy();
      const table = result.visualizations[0].name;
      cl.client.query('SELECT * FROM {table}', { table }, function(err, data) {
        // Use json schema validator
        expect(tv4.validate(data, schema)).toBeTruthy();
        done();
      });
    });
  });

// CARTO might be slow sometime...
}, 40000);
