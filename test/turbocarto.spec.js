const SqlApiDatasource = require('../lib/sqlApiDatasource');
const secret = require('./secret');
const CartodbLayers = require('../');

describe('Turbocarto preprocessor', function () {
  // Use the given crediential
  var cl = new CartodbLayers({ user: secret.USER, api_key: secret.API_KEY });
  // CARTO might be slow sometime...
  jest.setTimeout(40000)

  it('must transform Trubocarto to CartoCSS', async () => {
    SqlApiDatasource.prototype.querySummaryStats = jest.fn().mockImplementationOnce(async () => {
      return [ 1, 2, 3, 4, 5 ]
    });

    const sql = 'SELECT * FROM "erde_pop_2015"'
    const turbocarto = '#layer { polygon-fill: ramp([tabelle1_e], (#ffffb2, #fecc5c, #fd8d3c, #f03b20, #bd0026), quantiles); }'
    const cartocss = await cl.turbocarto.turbocartoToCartocss(turbocarto, sql)
    expect(cartocss).toBe('#layer { polygon-fill: #ffffb2; [ tabelle1_e > 1 ] { polygon-fill: #fecc5c } [ tabelle1_e > 2 ] { polygon-fill: #fd8d3c } [ tabelle1_e > 3 ] { polygon-fill: #f03b20 } [ tabelle1_e > 4 ] { polygon-fill: #bd0026 } }')
  });
});
