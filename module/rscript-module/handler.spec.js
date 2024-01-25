const assert = require('assert');
const {RscriptHandler, RscriptRawHandler} = require('./handler');

// array of dates in ms since epoch from 2019-01-01 to 2019-01-04
const RawRequest = {
    "types": ["type"],
    "label": ["date"],
}
const RawData = {
    "type": [2, 1, 3, 5],
    "date": [1546387200000, 1546300800000, 1546473600000, 1546560000000],
}
let RawDataOdd = RawData;
let RawDataLong = RawData;
const CalcRequest = {
    "types": ["type"],
    "sort": "year",
    "label": ["year"]
}
const CalcData = {
    "type": {
        "min": [-1, -2, 0, 1],
        "avg": [0, -1, 1, 2],
        "max": [1, 0, 2, 3],
        "year": [2020, 2019, 2021, 2021],
    }
}

describe(
    'Handler',
    function () {
        describe('Rscript', function () {
            describe('Calc', function () {
                it('min - should return -2', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'min').then(result => {
                        return assert.equal(result[0].y, -2);
                    })
                })
                it('max - should return 0', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'max').then(result => {
                        return assert.equal(result[0].y, 0);
                    })
                })
                it('avg - should return -1', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'avg').then(result => {
                        return assert.equal(result[0].y, -1);
                    })
                })
            })
            describe('Raw', function () {
                describe('merge check', function () {
                    before(function () {
                        for (let i = 0; i < 10; i++) {
                            RawDataOdd.type.push(Math.floor(Math.random() * 5) + 1);
                            RawDataOdd.date.push(RawDataOdd.date[RawDataOdd.date.length - 1] + 86400000);
                        }
                    })
                    it('check length', function () {
                        let handler = new RscriptRawHandler(RawDataOdd, RawRequest, 10);
                        return handler.get('type').then(result => {
                            return assert.equal(result.length,RawDataOdd.date.length);
                        })
                    })
                    describe('large test', function () {
                        before(function () {
                            for (let i = 0; i < 100000; i++) {
                                RawDataLong.type.push(Math.floor(Math.random() * 5) + 1);
                                RawDataLong.date.push(RawDataLong.date[RawDataLong.date.length - 1] + 86400000);
                            }
                        })
                        it('large test', () => {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest);
                            return handler.get('type').then(result => {
                                return assert.equal(result.length, RawDataLong.date.length);
                            })
                        })
                    })
                })
                it('should return 1', function () {
                    let handler = new RscriptRawHandler(RawData, RawRequest);
                    return handler.get('type').then(result => {
                        console.log(result)
                        return assert.equal(result[0].y, 1);
                    })
                });
            })
        })
    }
)