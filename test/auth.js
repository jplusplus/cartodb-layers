'use strict';
var     assert = require('assert'),
 CartodbLayers = require('../'),
       CartoDB = require('cartodb'),
        secret = require('./secret');


describe('Carto instanciation', function () {

  it('must successfully create a CartoLayers instance', function () {
    var cl = new CartodbLayers({});
    assert(cl instanceof CartodbLayers);
  });

  it('must successfully create a CartoDB instance', function () {
    var cl = new CartodbLayers({});
    assert(cl.client instanceof CartoDB.SQL);
  });

  it('must have successfully created a client', function () {
    // Crediential must exists
    assert(secret.USER !== undefined && secret.API_KEY !== undefined, 'Credientials not found.');
    // Use the given crediential
    var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
    // Event thrown when the client is connected
    assert(cl.client.user === secret.USER);
  });

});
