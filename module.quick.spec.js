const parser = require('./module.js')

global.climateplots = {
    dev: true
}
let specs = {
    type: 'temperature',
    station: 'abisko',
    baseline: {
        'start': 1960,
        'end': 1980
    }
}
let precipitation_specs = {
    type: 'precipitation',
    station: 'abisko',
    baseline: {
        'start': 1960,
        'end': 1980
    }
}
let configs = require('./config.json')
let cache = {}

const assert = require('assert');
describe(
    'Requests',
    function () {
        before(function () {
            let config = Object.assign(configs['latest'], specs)
            cache.result = parser.temperature(config)
        });
        describe.only('recursive', function () {
            it('promises', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then((values) => {
                    return assert.equal(values, 0.4771604938271605)
                })
            })
            it('promises & arrays', function () {
                let params = ['temperature', 'yrly', 'values', 0, 'x'];
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(function (values) {
                    return assert.equal(values, 2019)
                })
            })
            it('multiple', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                return Promise.all([parser.getByParams(config, params),
                    parser.getByParams(config, params)]).then(values => {
                    return assert.equal(values[0], values[1])
                })
            })
            it('cached', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                parser.getByParams(config, params)
                return parser.cache['abisko']['temperature'].then(values => {
                    return values
                })
            })
        })
        describe.only('functionality', function () {
            before(function () {
                let precipitation_config = Object.assign(configs['latest'], precipitation_specs)
                cache.resultPrecipitation = parser.precipitation(precipitation_config);
            })
            it('y', () => {
                let params = ['temperature', 'yrly', 'y']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return typeof values === 'number'
                })
            })
            it('shortValues', () => {
                let params = ['temperature', 'yrly', 'shortValues', 0, 'compressed']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, true)
                })
            })
            it('values', () => {
                let params = ['temperature', 'yrly', 'values', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 6)
                })
            })
            it('valuesAll', () => {
                return cache.result.then((res) => {
                    return res.yrly.then(yrly => {
                        return yrly.valuesAll.entry.then(all => {
                            return all.req.length > 1000
                        })
                    })
                })
            })
            it('a year', () => {
                return cache.result.then((res) => {
                    return res.yrly.then(yrly => {
                        return yrly.values.then(years => {
                            return assert.equal(2019, years[0].x)
                        })
                    })
                })
            })
            it('a DOY', () => {
                return cache.result.then((res) => {
                    return res.yrly.then(yrly => {
                        return yrly.values.then(year => {
                            year[0].values.then(doy => {
                                return assert.equal(0, doy[0].x)
                            })
                        })
                    })
                })
            })
            describe('changeY', function () {
                it('total - y', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values-308) < 0.00001)
                        //return assert.equal(values, 308)
                     })
                })
                it('values - total', () => {
                    let params = ['precipitation', 'yrlyFull', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 399.3) < 0.0001 )
                        //return assert.equal(values,399.2999999999999)
                    })
                })
                it('values - snow', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                      //  return assert.equal(values,132.8)
                    })
                })
                it('values - rain', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'rain', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 266.5) < 0.0001 )
                      //  return assert.equal(values,266.49999999999994)
                    })
                })
                it('shortValues', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'shortValues', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                       // return assert.equal(values, 132.8)
                    })
                })
            })
        })
        describe.only('functions',
            function () {
                before(function () {
                    cache.result[2019] = cache.result.then(res => {
                        return res.yrly.then(yrly => {
                            return yrly.values.then(values => {
                                return values[1]
                            })
                        })
                    })
                    cache.result[2025] = cache.result.then(res => {
                        return res.yrly.then(yrly => {
                            return yrly.values.then(values => {
                                return values[4]
                            })
                        })
                    })
                })
                it('empty', () => {
                    let params = ['temperature', 'yrly', 'values', 4, 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, undefined)
                    })
                })
                it('min', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'min', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, -26.6)
                    })
                })
                it('minAvg', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'minAvg', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, -16.7)
                    })
                })
                it('max', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'max', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 24.1)
                    })
                })
                it('maxAvg', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'maxAvg', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 18.1)
                    })
                })
                it('sum', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'sum', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 519.1)
                    })
                })
                it('first', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'first', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    parser.temperature.f = (e) => e <= 0;
                    return parser.getByParams(config, params).then(values => {

                        console.log('first',values)
                        return assert.equal(values, -4.6)
                    })
                 })
                 it('last', () => {
                     let params = ['temperature', 'yrly', 'values', 1, 'last', 'y']
                     let config = Object.assign(configs['latest'], specs)
                     parser.temperature.f = (e) => e <= 0;
                     return parser.getByParams(config, params).then(values => {
                         console.log('first',values)
                         return assert.equal(values, -4.5)
                     })

                 })
                it('number', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'values', 'length']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 365)
                    })
                })
                it('difference', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'difference', 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 2.3431622934364897)
                        // TODO OLD?! test validity
                        // return assert.equal(values, 1.4913425661630546)
                    })
                })
            })
    }
)