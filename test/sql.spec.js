'use strict';

var    secret = require('./secret'),
          tv4 = require('tv4'),
CartodbLayers = require('../');

describe('Carto SQL projection', function () {
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // Validation schema
  var schema = require("./schemas/sql.json");
  // CARTO might be slow sometime...
  jest.setTimeout(40000)

  it('must filter a layer using SQL', function (done) {
    cl.rest.tables(1,1).then(function(result) {
      // We must have at least 1 layer
      expect(result.total_entries).not.toBe(0);
      const table = result.visualizations[0].name;
      cl.client.execute(`SELECT * FROM ${table}`).done(function(data) {
        // Use json schema validator
        expect(tv4.validate(data, schema)).toBeTruthy();
        done();
      });
    });
  });
});
