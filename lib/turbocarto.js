const preprocessor = require('turbo-carto');
const Q = require('q');
const SqlApiDatasource = require('./sqlApiDatasource.js')
const Memoizable = require('./memoizable.js');

class Turbocarto extends Memoizable {
  constructor (rest) {
    super();
    this.rest = rest;
  }
  turbocartoToCartocss(turbocarto, sql) {
    const q = Q.defer();
    preprocessor(turbocarto, new SqlApiDatasource(sql, this.rest), (err, cartocss) => {
      return err ? q.reject(err) : q.resolve(cartocss);
    });
    return q.promise;
  }
}

module.exports = Turbocarto
