'use strict';

var join = require("path").join,
  exists = require('fs').existsSync,
  dotenv = require('dotenv');

// Path to the env file
const path = join(__dirname, '..', '.env');

// Check that the env file exists
if( exists(path) ) {
  // Load environement variables from .env
  dotenv.config({ path });
}

module.exports = {
  USER: process.env.CDB_USER,
  API_KEY: process.env.CDB_API_KEY
};
