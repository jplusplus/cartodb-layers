'use strict';
var join = require("path").join;
// Load environement variables from .env
require('dotenv').load({ path: join(__dirname, '..', '.env') });

module.exports = {
  USER: process.env.CDB_USER,
  API_KEY: process.env.CDB_API_KEY
};
