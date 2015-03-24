'use strict';
var     assert = require('assert'),
 CartodbLayers = require('../'),
       CartoDB = require('cartodb'),
        secret = require('./secret');

describe('cartodb-layers module', function () {

  it('must successfully create a CartoLayers instance', function () {
    var cl = new CartodbLayers({});
    assert(cl instanceof CartodbLayers);
  });

  it('must successfully create a CartoDB instance', function () {
    var cl = new CartodbLayers({});
    assert(cl.client instanceof CartoDB);
  });

  it('must have successfully authenticated the user', function (done) {
    var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
    // Event thrown when the client is connected
    cl.on('connect', done);
    // Connect the client
    cl.connect();
  });

});
