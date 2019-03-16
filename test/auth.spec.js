'use strict';
var     assert = require('assert'),
 CartodbLayers = require('../'),
       CartoDB = require('cartodb'),
        secret = require('./secret');

describe('Carto instanciation', function () {

  it('must successfully create a CartoLayers instance', function () {
    var cl = new CartodbLayers({});
    expect(cl instanceof CartodbLayers).toBeTruthy()
  });

  it('must successfully create a CartoDB instance', function () {
    var cl = new CartodbLayers({});
    expect(cl.client instanceof CartoDB.SQL).toBeTruthy()
  });

  it('must have successfully created a client', function () {
    // Crediential must exists
    expect(secret.USER !== undefined && secret.API_KEY !== undefined).toBeTruthy()
    // Use the given crediential
    var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
    // Event thrown when the client is connected
    assert(cl.client.user === secret.USER);
  });

});
