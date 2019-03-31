const identity = require('lodash/identity')

class SqlApiDatasource {
  constructor (sql, rest) {
    this.sql = sql;
    this.rest = rest;
  }
  getName () {
    return 'SqlApiDatasource';
  }
  getRamp (column, buckets, method, callback = identity) {
    if (!callback) {
      callback = method;
      method = 'equal';
    }
    method = method || 'equal';
    return this.querySummaryStats(this.sql, column, method, buckets)
      .then(values => callback(null, values))
      .catch(error  => callback(error, null));
  }
  async querySummaryStats (sql, column, method, buckets) {
    var methods = {
      quantiles: `CDB_QuantileBins(array_agg(distinct(${column}::numeric)), ${buckets}) as quantiles`,
      equal: `CDB_EqualIntervalBins(array_agg(${column}::numeric), ${buckets}) as equal`,
      jenks: `CDB_JenksBins(array_agg(distinct(${column}::numeric)), ${buckets}) as jenks`,
      headtails: `CDB_HeadsTailsBins(array_agg(distinct(${column}::numeric)), ${buckets}) as headtails`
    };

    const select = methods[method] || methods.quantiles;
    const q = `select ${select} from (${sql}) _table_sql where ${column} is not null`;
    const data = await this.rest.get('/v1/sql', { params: { q } });
    return data.rows[0][method];
  }
}

module.exports = SqlApiDatasource;
