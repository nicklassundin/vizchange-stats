const {Data} = require('./module.js')


global.climateplots = {
    dev: true
}
global.development = true;
/**
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
 */

const translate = require('./module/translate.js')
let configs = require('./config.json')
const assert = require('assert');

let stations = {
    get: (config) => {
        let hash = JSON.stringify(config);
        if(!stations.cache[hash]){
            stations.cache[hash] = stations.nestle(new Data(configs['live']), config);
            //stations.cache[hash] = stations.nestle(new Data(configs['latest']), config);
        }
        return stations.cache[hash];
    },
    nestle: function(data, station) {
        return (data).init(station);
    },
    cache: {},
    temperature: (sort, types) => {
        return translate.getStation('abisko').then(station => {
            station.types = ['avg_temperature', 'min_temperature', 'max_temperature'];
            if(types) station.types = types;
            station.sort = sort;
            return stations.get(station)
        })
    },
    calculated: {
        yrly: {
            temperature: () => stations.temperature('year')
        },
        monthly: {
            temperature: () => stations.temperature('month')
        },
        wkly: {
            temperature: () => stations.temperature('week')
        },
    },
    raw: {
        // TODO to large data structure need compression or change storage type
        precipitation: translate.getStation('abisko').then(station => {
            station.types = ['avg_temperature', 'precipitation']
            return nestle(new Data(configs['latest']), station)
        }),
        temperature: translate.getStation('abisko').then(station => {
            station.types = ['avg_temperature', 'min_temperature', 'max_temperature']
            return nestle(new Data(configs['live']), station)
        }),
        daily: {
            temperature: () => stations.temperature()
        }
    }
}

describe.skip(
    'Requests',
    function () {
        describe('new Implementation', function () {
            describe('Speed test', function () {
                beforeEach(() => {
                    console.time('Speed test');
                })
                afterEach(() => {
                    console.timeEnd('Speed test');
                })
                describe('server response', function () {
                    describe('calculated', function (done) {
                        it('year', function (done) {
                            stations.calculated.yrly.temperature().then((temp) => {
                                temp.response.then(() => {
                                    done()
                                })
                            })
                            this.timeout(3000)
                        })
                        it('month', function (done) {
                            stations.calculated.monthly.temperature().then(temp => {
                                temp.response.then(() => {
                                    done()
                                })
                            })
                            this.timeout(4000)
                        })
                        it('week', function (done) {
                            stations.calculated.wkly.temperature().then(temp => {
                                temp.response.then(() => {
                                    done()
                                })
                            })
                            this.timeout(5000)
                        })
                    })
                    describe('raw', function () {
                        it('day', function (done) {
                            this.slow(3000)
                            stations.raw.daily.temperature().then(temp => {
                                temp.response.then(() => {
                                    done()
                                })
                            })
                            this.timeout(8000)
                        })
                    })
                })
                describe('calculated', function () {
                    it('years', function () {
                        return stations.calculated.yrly.temperature().then(temp => {
                            return temp.min('avg_temperature').then(result => {
                                console.log('length', result.length)
                                console.log(result[99])
                                return true;
                            })
                        })
                    })
                    it('month', function () {
                        return stations.calculated.monthly.temperature().then(temp => {
                            return temp.min('avg_temperature').then(result => {
                                console.log('length', result.length)
                                console.log(result[99])
                                return true;
                            })
                        })
                    })
                    it('week', function () {
                        return stations.calculated.wkly.temperature().then(temp => {
                            return temp.min('avg_temperature').then(result => {
                                console.log('length', result.length)
                                console.log(result[99])
                                return true;
                            })
                        })
                    })
                })
                describe('raw', function () {
                    it('day', function () {
                        return stations.raw.daily.temperature().then(temp => {
                            return temp.min('avg_temperature').then(result => {
                                console.log(result.length)
                                console.log(result[99])
                                return true;
                            })
                        })
                    })
                })
            })
            describe('calculated', function () {
                describe('warmest / coldest', function () {
                    describe('year', function () {
                        describe('absolut', function () {
                            it('avg', () => {
                                return stations.calculated.yrly.temperature().then(temp => {
                                    return temp.mean('avg_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -0.95252732) < 0.001)
                                    })
                                })
                            })
                            it('min', () => {
                                return stations.calculated.yrly.temperature().then(temp => {
                                    return temp.min('min_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -34.0) < 0.001)
                                    })
                                })
                            })
                            it('max', () => {
                                return stations.calculated.yrly.temperature().then(temp => {
                                    return temp.max('max_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - 21.4) < 0.001)
                                    })
                                })
                            })
                        })
                    })
                    describe('month', function () {
                        describe('absolut', function () {
                            it('avg', () => {
                                return stations.calculated.monthly.temperature().then(temp => {
                                    return temp.mean('avg_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -11.7709677) < 0.001)
                                    })
                                })
                            })
                            it('min', () => {
                                return stations.calculated.monthly.temperature().then(temp => {
                                    return temp.min('min_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -25.10) < 0.001)
                                    })
                                })
                            })
                            it('max', () => {
                                return stations.calculated.monthly.temperature().then(temp => {
                                    return temp.max('max_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - 1.3) < 0.001)
                                    })
                                })
                            })
                        })
                    })
                    describe('week', function () {
                        describe('absolut', function () {
                            it('avg', () => {
                                return stations.calculated.wkly.temperature().then(temp => {
                                    return temp.mean('avg_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -17.9571428) < 0.001)
                                    })
                                })
                            })
                            it('min', () => {
                                return stations.calculated.wkly.temperature().then(temp => {
                                    return temp.min('min_temperature').then(result => {
                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -38.8) < 0.001)
                                    })
                                })
                            })
                            it('max', () => {
                                return stations.calculated.wkly.temperature().then(temp => {
                                    return temp.max('max_temperature').then(result => {
                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -22.1) < 0.001)
                                    })
                                })
                            })
                        })
                    })
                    describe('daily', function () {
                        describe('absolut', function () {
                            it('avg', () => {
                                return stations.raw.daily.temperature().then(temp => {
                                    return temp.mean('avg_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -0.7) < 0.001)
                                    })
                                })
                            })
                            it('min', () => {
                                return stations.raw.daily.temperature().then(temp => {
                                    return temp.min('min_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - -3.3) < 0.001)
                                    })
                                })
                            })
                            it('max', () => {
                                return stations.raw.daily.temperature().then(temp => {
                                    return temp.max('max_temperature').then(result => {

                                        console.log(result[99])
                                        return assert.ok(Math.abs(result[99].y - 2.6) < 0.001)
                                    })
                                })
                            })
                        })
                    })
                })
                it.skip('Moving Average', function () {
                    return stations.calculated.temperature.then(temp => {
                        return temp().ma('avg_temperature').then(result => {

                            return assert.equal(result.reduce((a, b) => {
                                if (a.x === 1996) {
                                    return a;
                                } else {
                                    return b
                                }
                            }).y, -26.9)
                        })
                    })
                })

            })
            describe.skip('raw', function () {
                describe('precipitation', function () {
                    it('snow', function () {
                        return stations.raw.precipitation.then(prec => {
                            return prec().snow().then(result => {

                                return result
                            })
                        })
                    })
                })
            })
        })
    })