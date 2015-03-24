'use strict';

var join = require("path").join,
  exists = require('fs').existsSync;

// Path to the env file
var env  = join(__dirname, '..', '.env');
// Check that the env file exists
if( exists(env) ) {
  // Load environement variables from .env
  require('dotenv').load({ path: env });
}

module.exports = {
  USER: process.env.CDB_USER,
  API_KEY: process.env.CDB_API_KEY
};
