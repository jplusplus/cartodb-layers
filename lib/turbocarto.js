const preprocessor = require('turbo-carto');
const Q = require('q');
const SqlApiDatasource = require('./sqlApiDatasource.js')
const Memoizable = require('./memoizable.js');

/** Class to manipulate TurboCarto strings. */
class Turbocarto extends Memoizable {
  /**
   * Create a Turbocarto instance
   * @param {Rest} rest - An instance of Rest
   */
  constructor (rest) {
    super();
    this.rest = rest;
  }
  /**
   * Populate the TurboCarto strings with data from an SQL query in order to generate CartoCSS.
   * @param {string} turbocarto - TurboCarto string.
   * @param {string} sql - SQL query to read data.
   * @return {Promise}
   */
  turbocartoToCartocss(turbocarto, sql) {
    const q = Q.defer();
    preprocessor(turbocarto, new SqlApiDatasource(sql, this.rest), (err, cartocss) => {
      return err ? q.reject(err) : q.resolve(cartocss);
    });
    return q.promise;
  }
}

module.exports = Turbocarto
