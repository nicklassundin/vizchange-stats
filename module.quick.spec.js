const parser = require('./module.js')
const fs = require('fs');

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
//console.log("Date:", new Date())
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
const help = require("climate-plots-helper");
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
                return parser.cache['abisko'][`temperature${config.dates.start}${config.dates.end}`].then(values => {
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
                let params = ['temperature', 'yrly', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 7)
                })
            })
            it('values - type', () => {
                let params = ['temperature', 'yrly', 'values']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.ok(Array.isArray(values))
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
                //let params = ['temperature', 'yrly', 'values', 0, 'values']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 1)
                })
            })
            describe('snow and rain', function () {
                it('yrlyFull - total - snow - y', () => {
                    let params = ['precipitation', 'yrly', 'snow', 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values-316.2000000000001) < 0.00001)
                        //return assert.equal(values, 308)
                     })
                })
                it('yrlyFull - values - total', () => {
                    let params = ['precipitation', 'yrly', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 399.3) < 0.0001 )
                        //return assert.equal(values,399.2999999999999)
                    })
                })
                it('yrlyFull - values - snow', () => {
                    let params = ['precipitation', 'yrly', 'snow', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                      //  return assert.equal(values,132.8)
                    })
                })
                it('yrlyFull - values - rain', () => {
                    let params = ['precipitation', 'yrly', 'rain', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 266.5) < 0.0001 )
                      //  return assert.equal(values,266.49999999999994)
                    })
                })
                it('yrlyFull - shortValues - snow', () => {
                    let params = ['precipitation', 'yrly', 'snow', 'shortValues', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 132.8) < 0.0001 )
                       // return assert.equal(values, 132.8)
                    })
                })
            })
            describe('type test', function() {
                describe('season', function() {
                    it('spring', () => {
                        let params = ['precipitation', 'spring', 'values', 0, 'y']
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok(Math.abs(values - 75.1) < 0.0001 )
                            // return assert.equal(values, 132.8)
                        })
                    })
                    it('summer', () => {
                        let params = ['precipitation', 'summer', 'shortValues', 0, 'y']
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok(Math.abs(values - 123.3) < 0.0001 )
                        })
                    })
                    it('summer - difference', () => {
                        let params = ['temperature', 'summer', 'difference', 10, 'y']
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok(Math.abs(values - 0.8613948739984973) < 0.0001 )
                        })
                    })
                })
                describe('growing Season', function() {
                    it('weeks', () => {
                        let params = ['temperature', 'weeks', 'growingSeason', 1, 'y']
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.equal(values, 22)
                        })
                    })
                    it('days - shortValues', () => {
                        let params = ['temperature', 'yrlyFull', 'growingSeason', 0]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.equal(values.y, 149)
                        })
                    })
                    it.skip('days', () => {
                        // TODO weird github missing 2020 values?
                        let params = ['temperature', 'yrlyFull', 'growingSeason', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.equal(values.y, 154)
                        })
                    })
                })
                it('decade', () => {
                    let params = ['precipitation', 'decades', 'values', 1, 'y']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 2923.2) < 0.0001 )
                    })
                })
                it('yrlySplit', () => {
                    let params = ['precipitation', 'yrlySplit', 'values', 1, 'y']
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        //console.log('values', values)
                        return assert.ok(Math.abs(values - 338.5) < 0.0001 )
                    })
                })
                it('30period - allTime', () => {
                    let params = ['precipitation', '30period', 'allTime', 'values', 1, 'y']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        //console.log('values', values)
                        return assert.ok(Math.abs(values - 17200.20000000039) < 0.0001 )
                    })
                })
                it('30period - 30periodyear', () => {
                    let params = ['precipitation', '30period', '30Periodyear', 'values', 1, 'y']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.ok(Math.abs(values - 9392.9) < 0.0001 )
                    })
                })
                it('splitDecades - alltimes - months', () => {
                    let params = ['precipitation', 'splitDecades', 'allTime', 'values']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all(values).then(resolved => {
                            return Promise.all(resolved.map(each => {
                                return each.x
                            })).then(ys => {
                                let expected = [7,8,9,10,11,12,13,14,15,16,17,18]
                                return assert.ok(ys+"" == expected+"")
                            })
                        })
                    })
                })
                it('splitDecades - splitDecade - decades', () => {
                    let params = ['precipitation', 'splitDecades', 'splitDecade', 'values']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all(values).then(resolved => {
                            return Promise.all(resolved.map(each => {
                                return each.x
                            })).then(ys => {
                                let expected = [1911, 1921, 1931, 1941, 1951, 1961]
                                return assert.ok(ys+"" == expected+"")
                            })
                        })
                    })
                })
                it('splitDecades - splitDecade - months', () => {
                    let params = ['precipitation', 'splitDecades', 'splitDecade', 'values', 3, 'values']
                    let config = Object.assign(configs['liveHalf'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all(values).then(resolved => {
                            return Promise.all(resolved.map(each => {
                                return each.x
                            })).then(ys => {
                                let expected = [7,8,9,10,11,12,13,14,15,16,17,18]
                                return assert.ok(ys+"" == expected+"")
                            })
                        })
                    })
                })
                describe('monthly', function () {
                    it('monthly', () => {
                        let params = ['precipitation', 'jan', 'values', 1, 'entry', 'monthName']
                        let config = Object.assign(configs['liveHalf'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.equal(values, 'jan')
                        })
                    })
                    it('monthly - values', () => {
                        let params = ['precipitation', 'jan', 'shortValues', 1, 'y']
                        let config = Object.assign(configs['liveHalf'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            return parser.getByParams(config, ['precipitation', 'jan', 'values', 1, 'entry', 'req']).then(all => {
                                //console.log(all[0])
                                all = all.map(entry => {
                                    entry = Number(entry.precipitation);
                                    if(isNaN(entry)) return 0;
                                    return entry
                                }).reduce((acc, entry) => acc + entry);
                                //console.log('values', values, 'all', all)
                                return assert.ok(Math.abs(values-all) < 0.0001)
                            })
                        })
                    })
                    it('monthly - shortValues', () => {
                        let help = require('climate-plots-helper')
                        let months = help.months()
                        months.push('yrlyFull')
                        return Promise.all(months.map(month => {
                            let params = ['precipitation', month, 'shortValues', 1, 'y']
                            let config = Object.assign(configs['latest'], precipitation_specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop()
                            let sum = values.reduce((a, b) => a + b)
                            //console.log('values', total, 'sum', sum)
                            return assert.ok(Math.abs(total - sum) < 0.0001)
                        })
                    })
                })
                describe('weeks', function() {
                    it('weeks', () => {
                        let help = require('climate-plots-helper')
                        let weeks = [['temperature', 'weeks', 'values', 1, 'y'],['temperature', 'yrly', 'shortValues', 1, 'y']]
                        return Promise.all(weeks.map(params => {
                            let config = Object.assign(configs['latest'], specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop()
                            values = values[0]
                            return assert.ok(Math.abs(total - values) < 0.01)
                        })
                    })
                    it('weeks - minAvg', () => {
                        let params = ['temperature', 'weeks', 'minAvg', 'values', 1, 'values', 1, 'y']
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.ok(Math.abs(values - 0.1) < 0.01)
                        })
                    })
                    it('weeks - maxAvg', () => {
                        let params = ['temperature', 'weeks', 'maxAvg', 'values', 1, 'values', 1, 'y']
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok( Math.abs(values - -4.2) < 0.01)
                        })
                    })
                })
                describe('months', function() {
                    it('months - shortValues', () => {
                        let help = require('climate-plots-helper')
                        let months = Object.keys(help.months()).map(key => {
                            return ['precipitation', 'months', 'values', 1, 'values', key, 'y']
                            //return ['precipitation', 'months', 'values', 1, 'values', key, 'entry', 'req']
                        })
                        months.push(['precipitation', 'yrly', 'shortValues', 1, 'y'])
                        //months.push(['precipitation', 'yrly', 'values', 1, 'specs', 'dates'])
                        return Promise.all(months.map(params => {
                            let config = Object.assign(configs['latest'], precipitation_specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop()
                            values = values.reduce((a,b) => a + b)
                            //console.log("total", total, "values", values)
                            return assert.ok(Math.abs(total - values) < 0.0001)
                        })
                    })
                })
            })
        })
        describe('functions',
            function () {
                before(() => {
                 //   parser.clear()
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
                describe('frost', () => {
                    it('last', () => {
                        let params = ['temperature', 'yrly', 'values', 1, 'last', 'y']
                        let config = Object.assign(configs['latest'], specs)
                        parser.temperature.f = (e) => e <= 0;
                        return parser.getByParams(config, params).then(values => {
                            return assert.equal(values, -4.6)
                        })
                    })
                    it('first', () => {
                        let params = ['temperature', 'yrly', 'values', 1, 'first', 'y']
                        let config = Object.assign(configs['latest'], specs)
                        parser.temperature.f = (e) => e <= 0;
                        return parser.getByParams(config, params).then(values => {
                            return assert.equal(values, -4.5)
                        })
                    })
                })

                it('number', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'values', 'length']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 364)
                    })
                })
                it('difference', () => {
                    let params = ['temperature', 'yrly', 'difference', 2, 'y']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 1.0946784014248185)
                        // TODO OLD?! test validity
                        // return assert.equal(values, 1.4913425661630546)
                    })
                })
                it('precipitation - difference', () => {
                    let params = ['precipitation', 'yrly', 'difference'];
                    let config = Object.assign(configs['latest'], precipitation_specs)
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all(values).then(array => {
                            return assert.equal(array.length, 7)
                        })
                    })
                })
            })
        describe('Simulated requests', function(){
            it('precipitation snow', () => {
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 7)
                })
            })
            it('precipitation rain', () => {
                let params = ['precipitation', 'yrly', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 7)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            it('difference', () => {
                let params = ['precipitation', 'yrly', 'difference', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 7)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            it('difference', () => {
                let params = ['temperature', 'yrly', 'difference', 0, 'y']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 1.730020867178243)
                    /* TODO check validitys
                    return assert.equal(values, 2.3431622934364897)
                     */
                })
            })
            /*
            it('Live Half', () => {
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 'length']
                let config = Object.assign(configs['liveHalf'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 57)
                })
            })
             */
            it('empty - test', () => {
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 2, 'y']
                let config = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values.length, undefined)
                })
            })
            it('latest - snow - y', () => {
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 1, 'y']
                let config = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.ok(Math.abs(values - 132.79999999999998) < 0.0001 )
                })
            })
            it('latest - rain - y', () => {
                let params = ['precipitation', 'yrly', 'rain', 'shortValues', 1, 'y']
                let config = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.ok(Math.abs(values - 266.49999) < 0.0001 )
                })
            })
            it('live - test', () => {
               // let params = ['precipitation', 'yrly', 'snow', 'shortValues']
               let config = Object.assign(configs['liveHalf'], precipitation_specs)
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 0, 'y']
                //let config = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config, params).then(values => {
                    //console.log('values', values)
                    return assert.ok(Math.abs(values - 171.29999999999978) < 0.1)
                })
            })
            it('Check snow and rain', () => {
                let config = Object.assign(configs['latest'], precipitation_specs)
                let params = ['precipitation', 'yrly', 'rain', 'y']

                let rain = parser.getByParams(config, params).then(values => {
                        return values
                })
                let rain2 = parser.getByParams(config, params).then(values => {
                    return values
                })
                let params1 = ['precipitation', 'yrly', 'snow', 'y']
                let config1 = Object.assign(configs['latest'], precipitation_specs)
                let snow = parser.getByParams(config1, params1).then(values => {
                    return values
                })
                let params2 = ['precipitation', 'yrly', 'y']
                let config2 = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config2, params2).then(values => {
                    return snow.then(value1 => {
                        return rain.then(value2 => {
                            assert.ok(Math.abs(values - (value1+value2)) < 10)
                        })
                    })
                })
            })
        })
    }
)
