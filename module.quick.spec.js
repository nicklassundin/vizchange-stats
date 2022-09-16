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
        describe('recursive', function () {
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
        describe('functionality', function () {
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
            it('short', () => {
                let params = ['temperature', 'yrly']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(typeof values.short().then, 'function')
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
                let params = ['temperature', 'yrly', 'valuesAll', 'entry', 'req', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 1461)
                })
            })
            it('a year', () => {
                let params = ['temperature', 'yrly', 'values', 0, 'x']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 2019)
                })
            })
            it('order - a DOY - first', () => {
                let params = ['temperature', 'yrly', 'values', 0, 'values', 0, 'x']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 1)
                })
            })
            describe('changeY', function () {
                it('yrlyFull - total - snow - y', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values-308) < 0.00001)
                        //return assert.equal(values, 308)
                     })
                })
                it('yrlyFull - values - total', () => {
                    let params = ['precipitation', 'yrlyFull', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 399.3) < 0.0001 )
                        //return assert.equal(values,399.2999999999999)
                    })
                })
                it('yrlyFull - values - snow', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                      //  return assert.equal(values,132.8)
                    })
                })
                it('yrlyFull - values - rain', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'rain', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 266.5) < 0.0001 )
                      //  return assert.equal(values,266.49999999999994)
                    })
                })
                it('yrlyFull - shortValues - snow', () => {
                    let params = ['precipitation', 'yrlyFull', 'changeY', 'snow', 'shortValues', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                       // return assert.equal(values, 132.8)
                    })
                })
            })
        })
        describe('functions',
            function () {
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
                        return assert.equal(values, -4.6)
                    })
                 })
                 it('last', () => {
                     let params = ['temperature', 'yrly', 'values', 1, 'last', 'y']
                     let config = Object.assign(configs['latest'], specs)
                     parser.temperature.f = (e) => e <= 0;
                     return parser.getByParams(config, params).then(values => {
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
                it('precipitation - difference', () => {
                    let params = ['precipitation', 'yrly', 'difference', 'shortValues'];
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all(values).then(array => {
                            return assert.equal(array.length, 6)
                        })
                    })
                })
            })
        describe('Simulated requests', function(){
            it('precipitation snow', () => {
                let params = ['precipitation', 'yrly', 'changeY', 'snow', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 6)
                })
            })
            it('precipitation rain', () => {
                let params = ['precipitation', 'yrly', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 6)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            it('difference', () => {
                let params = ['precipitation', 'yrly', 'difference', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 6)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            it('difference', () => {
                let params = ['temperature', 'yrly', 'difference', 'values', 0, 'y']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 1.1674387000899455)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            it('Live Half', () => {
                let params = ['precipitation', 'yrly', 'changeY', 'snow', 'shortValues', 'length']
                let config = Object.assign(configs['liveHalf'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 57)
                })
            })
            it('Live', () => {
                let params = ['precipitation', 'yrly', 'changeY', 'snow', 'shortValues', 'length']
                let config = Object.assign(configs['live'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 115)
                })
            })
        })
    }
)
