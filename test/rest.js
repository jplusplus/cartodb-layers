'use strict';

var    assert = require('assert'),
CartodbLayers = require('../'),
          tv4 = require('tv4'),
       secret = require('./secret');

describe('CartoDB REST client', function () {
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });

  it('must reach per-user CartoDB REST API', function (done) {
    cl.rest.get("v1/viz/").on("complete", function(result) {
      // Result must not be be an instance of error
      assert(!(result instanceof Error));
      done();
    });
  });

  it('must validate a JSON schema', function (done) {
    // Validation schema
    var schema = require("./schemas/viz.json");
    // Get some data
    cl.rest.get("v1/viz/").on("complete", function(result) {
      // Use json schema validator
      assert( tv4.validate(result, schema),  !tv4.error || tv4.error.message );
      done();
    });
  });

});
