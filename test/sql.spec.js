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

  it('must filter a layer using SQL', done => {
    cl.rest.memoized.layers(1,1).then(result => {
      cl.rest.memoized.vizTable(result.visualizations[0].id).then(table => {
        cl.client.execute(`SELECT * FROM ${table} LIMIT 2`).done(data => {
          // Use json schema validator
          expect(tv4.validate(data, schema)).toBeTruthy();
          done();
        })
      });
    });
  });
});
