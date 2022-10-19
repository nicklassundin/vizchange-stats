const parser = require('./module.js')
const fs = require('fs');
global.climateplots = {
    dev: true
}
global.development = true;
class Specs  {
    constructor(config, type) {
        this.config = config
        this.type = type;
    }
    'getConfig' (type, station = 'abisko') {
        let config = Object.assign({type: type, station: station}, this.config)
        return Object.assign(configs[this.type], config)
    }
}
let specs = {
    type: 'temperature',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
//console.log("Date:", new Date())
let precipitation_specs = {
    type: 'precipitation',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
let freezeup_specs = {
    type: 'freezeup',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
let breakup_specs = {
    type: 'breakup',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
let icetime_specs = {
    type: 'icetime',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
let co2_weekly_specs = {
    type: 'co2_weekly',
    station: 'glob',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
let snowdepth_single_specs = {
    type: 'snowdepth_single',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    },
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
                let params = ['temperature', 'yrly', 'shortValues', 1];
                let config = Object.assign(configs['liveHalf'], specs)
                return parser.getByParams(config, params).then((values) => {
                    //console.log(values)
                    //return assert.ok(Math.abs(values.y - -0.4282191780821911) < 0.0001)

                    // TODO avg error
                    //return assert.ok(Math.abs(values.y - -0.46393442622950815) < 0.0001)
                    return assert.ok(Math.abs(values.y - -0.43) < 0.05)
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
            describe('shortValues', function () {
                describe('x', function () {
                    it('year', () => {
                        let params = ['temperature', 'yrly', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.x, 2020)
                        })
                    })
                    it('monthly', () => {
                        let params = ['temperature', 'monthly', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.x, 'feb')
                        })
                    })
                    it('months', () => {
                        let params = ['temperature', 'months', 'values', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.x, 2020)
                        })
                    })
                    it('months', () => {
                        let params = ['temperature', 'months', 'values', 1, 'shortValues', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.x, 'feb')
                        })
                    })
                    it('snow', () => {
                        let params = ['precipitation', 'yrly', 'snow', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.x, 2020)
                        })
                    })
                })
            })
            it('y', () => {
                let params = ['temperature', 'yrly', 'y']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return typeof values === 'number'
                })
            })
            it('short', () => {
                let params = ['temperature', 'yrly']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(typeof values.short.then, 'function')
                })
            })
            it('values', () => {
                let params = ['temperature', 'yrly', 'shortValues', 'length']
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.equal(values, 6)
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
            describe('type', function() {
                describe('snowdepth', function() {
                    it('snow depth', () => {
                        let params = ['snowdepth_single', 'yrlyFull', 'shortValues', 60]
                        let config = Object.assign(configs['live'], snowdepth_single_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 27.37) < 1)
                        })
                    })
                    describe('decades', function() {
                        it('allTime', () => {
                            let params = ['snowdepth_single', 'splitDecades', 'shortValues', 4]
                            let config = Object.assign(configs['live'], snowdepth_single_specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.ok(Math.abs(values.y - 28) < 1)
                            })
                        })
                        it('decades', () => {
                            let params = ['snowdepth_single', 'splitDecades', 'shortValues', 3]
                            let config = Object.assign(configs['liveHalf'], snowdepth_single_specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.ok(Math.abs(values.y - 14) < 1)
                            })
                        })
                        it('decades - year', () => {
                            let params = ['snowdepth_single', 'splitDecades', 'values', 2, 'shortValues']
                            let config = Object.assign(configs['liveHalf'], snowdepth_single_specs)
                            return parser.getByParams(config, params).then(values => {
                                return Promise.all(values).then(resolved => {
                                    return Promise.all(resolved.map(each => {
                                        return each.x
                                    })).then(ys => {
                                        let expected = [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980]
                                        //console.log(expected, ys)
                                        return assert.ok(ys+"" == expected+"")
                                    })
                                })
                            })
                        })
                    })
                    describe('precipitation', function() {
                        it('difference', () => {
                            let params = ['precipitation', 'yrly', 'difference'];
                            let config = Object.assign(configs['live'], precipitation_specs)
                            return parser.getByParams(config, params).then(values => {
                                return Promise.all(values).then(array => {
                                    //console.log(values)
                                    return assert.equal(array.length, 115)
                                })
                            })
                        })
                        it('total', () => {
                            let params = ['precipitation', 'yrly', 'values', 1, 'y']
                            let config = Object.assign(configs['latest'], precipitation_specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.ok(Math.abs(values - 399.3) < 0.0001 )
                                //return assert.equal(values,399.2999999999999)
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
                        describe('snow', function() {
                            it('y', () => {
                                let params = ['precipitation', 'yrly', 'snow', 'y']
                                let config = Object.assign(configs['latest'], precipitation_specs)
                                return parser.getByParams(config, params).then(values => {
                                    return assert.ok(Math.abs(values-316.2000000000001) < 0.00001)
                                })
                            })
                            it('shortValues', () => {
                                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 1]
                                let config = Object.assign(configs['latest'], precipitation_specs)
                                return parser.getByParams(config, params).then(values => {
                                    //console.log(values)
                                    return assert.ok(Math.abs(values.y - 132.8) < 0.0001 )
                                    // return assert.equal(values, 132.8)
                                })
                            })
                        })
                        describe('rain', function () {
                            it('yrlyFull - values - rain', () => {
                                let params = ['precipitation', 'yrly', 'rain', 'shortValues', 1]
                                let config = Object.assign(configs['latest'], precipitation_specs)
                                return parser.getByParams(config, params).then(values => {
                                    //console.log(values)
                                    return assert.ok(Math.abs(values.y - 266.5) < 0.0001 )
                                    //  return assert.equal(values,266.49999999999994)
                                })
                            })
                        })
                    })
                    describe('30period', () => {
                        // TODO
                    })
                })
                describe('co2_weekly', function() {
                    it('value', () => {
                        let params = ['co2_weekly', 'all', 'shortValues', 0]
                        let config = Object.assign(configs['latest'], co2_weekly_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 410.25)
                        })
                    })
                })
                describe('warmest / coldest', function() {
                    describe('weeks', function() {
                        it('max', () => {
                            let params = ['temperature', 'weekly', 'maxAvg', 'shortValues', 40]
                            let config = Object.assign(configs['liveHalf'], specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.equal(values.y, 20.3)
                            })
                        })
                        it('min', () => {
                            let params = ['temperature', 'weekly', 'minAvg', 'shortValues', 40]
                            let config = Object.assign(configs['liveHalf'], specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.equal(values.y, -28.6)
                            })
                        })
                    })
                    describe('daily' , function() {
                        it('max', () => {
                            let params = ['temperature', 'yrly', 'max', 'shortValues', 40]
                            let config = Object.assign(configs['liveHalf'], specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.equal(values.y, 26.9)
                            })
                        })
                        it('min', () => {
                            let params = ['temperature', 'yrly', 'min', 'shortValues', 40]
                            let config = Object.assign(configs['liveHalf'], specs)
                            return parser.getByParams(config, params).then(values => {
                                //console.log(values)
                                return assert.equal(values.y, -31.5)
                            })
                        })
                    })
                })
                describe('lake', function() {
                    it('breakup', () => {
                        let params = ['breakup', 'yrly', 'shortValues', 0];
                        let config = Object.assign(configs['latest'], breakup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 156)
                        })
                    })
                    it('breakup - difference', () => {
                        let params = ['breakup', 'yrly', 'difference', 60];
                        let config = Object.assign(configs['live'], breakup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 5) < 0.1)
                        })
                    })
                    it('freeze-up - 1971', () => {
                        let params = ['freezeup', 'yrly', 'shortValues', 60];
                        let config = Object.assign(configs['live'], freezeup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 364)
                        })
                    })
                    it('freeze-up - 2021', () => {
                        let params = ['freezeup', 'yrly', 'shortValues', 9];
                        let config = Object.assign(configs['live'], freezeup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 320)
                        })
                    })
                    it('freeze-up - 1972', () => {
                        let params = ['freezeup', 'yrly', 'shortValues', 61];
                        let config = Object.assign(configs['live'], freezeup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 370)
                        })
                    })
                    it('freezeup - difference', () => {
                        let params = ['freezeup', 'yrly', 'difference', 60];
                        let config = Object.assign(configs['live'], freezeup_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 12) < 0.1)
                        })
                    })
                    it('icetime', () => {
                        let params = ['icetime', 'yrlyFull', 'shortValues', 60];
                        let config = Object.assign(configs['live'], icetime_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 170) < 0.1)
                        })
                    })
                })

                describe('extreme', function() {
                    it('high', () => {
                        let params = ['temperature', 'yrly', 'max', 'high', 20, 'shortValues', 11]
                        let config = Object.assign(configs['liveHalf'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 22)
                        })
                    })
                    it('high full', () => {
                        let params = ['temperature', 'yrly', 'max', 'high', 20, 'shortValues', 104]
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 29)
                        })
                    })
                    it('low', () => {
                        let params = ['temperature', 'yrly', 'min', 'low', -10, 'shortValues', 11]
                        let config = Object.assign(configs['liveHalf'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.y, 100)
                        })
                    })
                })
                describe('frost', function() {
                    it('first', () => {
                        let params = ['temperature', 'yrlySplit', 'min', 'first', 'shortValues', 10];
                        let config = Object.assign(configs['liveHalf'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.equal(values.date.getDate(), 30)
                        })
                    })
                    it('last', () => {
                        let params = ['temperature', 'yrlySplit', 'min', 'last', 'shortValues', 10]
                        let config = Object.assign(configs['liveHalf'], specs)
                        parser.temperature.f = (e) => e <= 0;
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values.date.getDate(), 4)
                        })
                    })
                })
                describe('season', function() {
                    it('x', () => {
                        let params = ['precipitation', 'spring', 'shortValues', 0, 'x']
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.equal(values, 2019)
                        })
                    })
                    it('spring', () => {
                        let params = ['precipitation', 'spring', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 52.5) < 0.0001 )
                            // return assert.equal(values, 132.8)
                        })
                    })
                    it('summer', () => {
                        let params = ['precipitation', 'summer', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 142.7) < 0.0001 )
                        })
                    })
                    it('autumn', () => {
                        let params = ['precipitation', 'autumn', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 110.6) < 0.0001 )
                        })
                    })
                    it('winter', () => {
                        let params = ['precipitation', 'winter', 'shortValues', 0]
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 143.1) < 0.0001 )
                        })
                    })
                    it.skip('shortValues', () => {
                        let help = require('climate-plots-helper')
                        let seasons = Object.keys(help.seasons).map(key => {
                            //console.log(key)
                            return ['precipitation', key, 'shortValues', 1]
                            //return ['precipitation', 'months', 'values', 1, 'values', key, 'entry', 'req']
                        })
                        seasons.push(['precipitation', 'yrly', 'shortValues', 1])
                        //months.push(['precipitation', 'yrly', 'values', 1, 'specs', 'dates'])
                        return Promise.all(seasons.map(params => {
                            let config = Object.assign(configs['latest'], precipitation_specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop().y
                            //console.log(values)
                            values = values.map(each => each.y).reduce((a,b) => a + b)
                            //console.log("total", total, "values", values)
                            return assert.ok(Math.abs(total - values) < 0.0001)
                        })
                    })
                    it.skip('summer - difference', () => {
                        let params = ['temperature', 'summer', 'difference', 11]
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 0.8613948739984973) < 0.0001 )
                        })
                    })
                })
                describe('growing Season', function() {
                    it('weeks', () => {
                        let params = ['temperature', 'weekly', 'growingSeason', 'shortValues', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.equal(values.y, 22)
                        })
                    })
                    it.only('full test', () => {
                        let params = ['temperature', 'weekly', 'growingSeason', 'shortValues']
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return Promise.all(values).then(values => {
                                values = values.map((value, i) => value.x == i+1910)
                                return assert.ok(values.reduce((a, b) => a && b))
                            })
                            return assert.equal(values.y, 22)
                        })
                    })
                    it('days', () => {
                        let params = ['temperature', 'yrlyFull', 'growingSeason', 'shortValues', 0]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.equal(values.y, 149)
                        })
                    })
                    it('difference', () => {
                        let params = ['temperature', 'yrlyFull', 'growingSeason', 'difference', 90]
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.ok(Math.abs(values.y - 21) < 1)
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
                describe('decade', function () {
                    it('x', () => {
                        let params = ['precipitation', 'decades', 'shortValues', 4, 'x']
                        let config = Object.assign(configs['liveHalf'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.equal(values, 1950)
                        })
                    })
                    it('decade', () => {
                        let params = ['precipitation', 'decades', 'values', 1, 'y']
                        let config = Object.assign(configs['liveHalf'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.ok(Math.abs(values - 2923.2) < 0.0001 )
                        })
                    })
                })
                describe('yrlySpit', function () {
                    it('values', () => {
                        let params = ['precipitation', 'yrlySplit', 'shortValues', 1, 'y']
                        let config = Object.assign(configs['latest'], precipitation_specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log('values', values)
                            return assert.ok(Math.abs(values - 338.5) < 0.0001 )
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
                    it('values', () => {
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
                })
                describe('weeks', function() {
                    it('individual', () => {
                        let params = ['temperature', 'weekly', 'values', 1, 'shortValues']
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return Promise.all(values).then(all => {
                                return assert.ok(all.map((entry, i) => {
                                    return entry.x === i + 1;
                                }).reduce((a, b) => a && b))
                            })
                        })
                    })
                    it('sum', () => {
                        let help = require('climate-plots-helper')
                        let weeks = [['temperature', 'weekly', 'shortValues', 1, 'y'],['temperature', 'yrly', 'shortValues', 1, 'y']]
                        return Promise.all(weeks.map(params => {
                            let config = Object.assign(configs['latest'], specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop()
                            //console.log(values)
                            values = values[0]
                            //console.log('total', total, 'values', values)
                            return assert.ok(Math.abs(total - values) < 0.01)
                        })
                    })
                    it('minAvg', () => {
                        let params = ['temperature', 'weekly', 'minAvg', 'values', 1, 'shortValues', 1]
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok(Math.abs(values.y - -4.2) < 0.01)
                        })
                    })
                    it('maxAvg', () => {
                        let params = ['temperature', 'weekly', 'maxAvg', 'values', 1, 'values', 1, 'y']
                        let config = Object.assign(configs['latest'], specs)
                        return parser.getByParams(config, params).then(values => {
                            return assert.ok( Math.abs(values - 0.1) < 0.01)
                        })
                    })
                })
                describe('months', function() {
                    it('shortValues', () => {
                        let help = require('climate-plots-helper')
                        let months = Object.keys(help.months()).map(key => {
                            //console.log(key)
                            return ['precipitation', 'months', 'values', 1, 'shortValues', key]
                            //return ['precipitation', 'months', 'values', 1, 'values', key, 'entry', 'req']
                        })
                        months.push(['precipitation', 'yrly', 'shortValues', 1])
                        //months.push(['precipitation', 'yrly', 'values', 1, 'specs', 'dates'])
                        return Promise.all(months.map(params => {
                            let config = Object.assign(configs['latest'], precipitation_specs)
                            return parser.getByParams(config, params)
                        })).then(values => {
                            let total = values.pop()
                            //console.log(values[2].xInterval)
                            //console.log(values[0].xInterval)
                            //console.log(total)
                            //console.log(values)
                            //console.log(values)
                            values = values.map(each => each.y)
                            values = values.reduce((a,b) => a + b)
                            //console.log("total", total, "values", values)
                            return assert.ok(Math.abs(total.y - values) < 0.0001)
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
                        return assert.ok(isNaN(values) || values === undefined)
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
                        return assert.ok(Math.abs(values - 519.1) < 0.00001)
                    })
                })
                it('number', () => {
                    let params = ['temperature', 'yrly', 'values', 1, 'values', 'length']
                    let config = Object.assign(configs['latest'], specs)
                    return parser.getByParams(config, params).then(values => {
                        return assert.equal(values, 365)
                    })
                })
                describe('baseline', function () {
                    it('value', () => {
                        let params = ['temperature', 'yrly', 'baseline']
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            //return assert.ok( Math.abs(values - (-0.7873900649056548)) < 0.01)
                            // TODO difference between estimated from server and client side
                            //return assert.ok( Math.abs(values - (-0.8067076562515705)) < 0.01)
                            return assert.ok( Math.abs(values - (-0.7873900649056548)) < 0.05)
                        })
                    })
                })
                describe('difference', () => {
                    it('y', () => {
                        let params = ['temperature', 'yrly', 'difference', 105]
                        let config = Object.assign(configs['live'], specs)
                        return parser.getByParams(config, params).then(values => {
                            //console.log(values)
                            return assert.ok(Math.abs(values.y - 2.01) < 0.1)
                        })
                    })
                })
            })
        describe('Simulated requests', function(){
            it('precipitation snow', () => {
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 'length']
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
                let params = ['temperature', 'yrly', 'difference', 3]
                let config = Object.assign(configs['live'], specs)
                return parser.getByParams(config, params).then(values => {
                    //console.log(values)
                    return assert.ok(Math.abs(values.y - (-0.135)) < 0.01)
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
                let params = ['precipitation', 'yrly', 'snow', 'shortValues', 0]
                //let config = Object.assign(configs['latest'], precipitation_specs)
                return parser.getByParams(config, params).then(values => {
                    //console.log('values', values)
                    return assert.ok(Math.abs(values.y - 92.2) < 0.1)
                })
            })
        })
        describe('speed tests', function() {
            it.skip('difference', () => {
                let params = ['temperature', 'yrly', 'difference', 11]
                let config = Object.assign(configs['live'], specs)
                return parser.getByParams(config, params).then(values => {
                    return assert.ok(Math.abs(values.y - 0.8613948739984973) < 0.0001 )
                })
            })
            it('single', () => {
                let params = ['temperature', 'yrly', 'shortValues']
                let config = Object.assign(configs['live'], specs)
                const startTime = (new Date()).getTime();
                return parser.getByParams(config, params).then(values => {
                    return Promise.any(values).then(values => {
                        let endTime = (new Date()).getTime();
                        //console.log(endTime - startTime)
                        return assert.ok( endTime - startTime < 10000)
                    })
                })
            })
            describe('time to load', function() {
                it('temperature', () => {
                    let params = ['temperature', 'yrly', 'shortValues']
                    let config = Object.assign(configs['live'], specs)
                    const startTime = (new Date()).getTime();
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all([values[35], values[40], values[70]]).then(values => {
                            let endTime = (new Date()).getTime();
                            //console.log(endTime - startTime)
                            return assert.ok( endTime - startTime < 10000)
                        })
                    })
                })
                it('precipitation', () => {
                    let params = ['precipitation', 'yrly', 'shortValues']
                    let config = Object.assign(configs['live'], precipitation_specs)
                    let startTime = (new Date()).getTime();
                    return parser.getByParams(config, params).then(values => {
                        return Promise.all([values[35], values[40], values[70]]).then(values => {
                            let endTime = (new Date()).getTime();
                            //console.log(endTime - startTime)
                            return assert.ok( endTime - startTime < 25000)
                        })
                    })
                })
            })
            it.skip('order of resolve', () => {
                let params = ['temperature', 'yrly', 'shortValues']
                let config = Object.assign(configs['live'], specs)
                const startTime = (new Date()).getTime();
                return parser.getByParams(config, params).then(values => {
                    return Promise.all([values[0],values[70]].map(each => {
                        return each.then(() => {
                            return (new Date()).getTime();
                        })
                    })).then(times => {
                        //console.log(times[0] - times[1])
                        return assert.ok(times[0] - times[1] > 0)
                    })
                })
            })
        })
    }
)
