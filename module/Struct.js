// Struct.js
import Point from './Point.js';
import curl from './utility/gateway.js';
import { getDateOfWeek, ColorToHex, replace, climatePlotsHelper } from './helpers/help.js';
import fetchData from './helpers/dataFetcher.js';


class Extreme {
    constructor(struct, type) {
        this.parent = struct;
        this.type = type;
    }

    getValue(lim) {
        switch (this.type) {
            case 'high':
                return this.parent.TYPE(this.type, (e) => e.y >= lim, true);
            case 'low':
                return this.parent.TYPE(this.type, (e) => e.y <= lim, true);
            default:
                return this.parent;
        }
    }
}

export default class Struct {
    static build(seedSpecs, x, type, f = () => true, full = false, parentType, parentEntry) {
        switch (seedSpecs.type) {
            case 'freezeup':
            case 'breakup':
                type = 'breakfreeze';
                full = true;
                break;
            case 'lakeice':
                full = true;
                break;
            default:
        }
        let specs = JSON.parse(JSON.stringify(seedSpecs));
        let y1 = 0;
        let y2 = 0;
        let m1 = 0;
        let d1 = 1;
        let m2 = 0;
        let d2 = 1;
        specs.dates.type = specs.type;
        switch (specs.keys[0]) {
            case 'month':
                y2 = -1;
                m1 = climatePlotsHelper.months().indexOf(x);
                m2 = climatePlotsHelper.months().indexOf(x) + 1;
                break;
            case 'months':
                y2 = 2;
                break;
            case 'week':
                d2 = 0;
                y2 = 2;
                specs.dates.start = getDateOfWeek(specs.x, (new Date(specs.dates.start)).getFullYear());
                specs.dates.end = specs.dates.start.addDays(7);
                break;
            case 'jan':
            case 'feb':
            case 'mar':
            case 'apr':
            case 'may':
            case 'jun':
            case 'jul':
            case 'aug':
            case 'sep':
            case 'oct':
            case 'nov':
                specs.dates.type = 'month';
                y2 = 1;
                m1 = climatePlotsHelper.months().indexOf(specs.keys[0]);
                m2 = m1 + 1;
                break;
            case 'dec':
                specs.dates.type = 'month';
                specs.dates.month = 'dec';
                y2 = 1;
                m1 = climatePlotsHelper.months().indexOf(specs.keys[0]);
                m2 = m1 + 1;
                break;
            case 'spring':
                m1 = 2;
                m2 = 5;
                y2 = -1;
                specs.dates.type = specs.keys[0];
                break;
            case 'summer':
                m1 = 5;
                m2 = 8;
                y2 = -1;
                specs.dates.type = specs.keys[0];
                break;
            case 'autumn':
                m1 = 8;
                m2 = 11;
                y2 = -1;
                specs.dates.type = specs.keys[0];
                break;
            case 'winter':
                m1 = 11;
                m2 = 2;
                y2 = 0;
                specs.dates.type = specs.keys[0];
                break;
            case 'decade':
                y2 = 10;
                break;
            case '30period':
            case '30periodyear':
                y1 = -1;
                y2 = 30;
                m1 = 7;
                m2 = 7;
                break;
            case 'splitMonth':
                y1 = (x < 12) ? -1 : 0;
                y2 = 0;
                m1 = (x > 12) ? x - 12 : x;
                m2 = (x > 12) ? x - 12 : x;
                specs.dates.type = climatePlotsHelper.monthByIndex(x);
                break;
            case 'monthly':
                break;
            case 'splitDecades':
                m1 = 5;
                m2 = 7;
                y2 = 10;
                break;
            case 'yrlySplit':
            case 'splitYear':
                y1 = -1;
                y2 = 0;
                m1 = 7;
                m2 = 7;
                break;
            default:
                if (typeof specs.dates.end === 'string') {
                    specs.dates.start = new Date(specs.dates.start);
                    specs.dates.end = new Date(specs.dates.end);
                    return new Struct(parentEntry, specs, x, type, f, full, parentType);
                }
        }
        if (typeof specs.dates.start === 'number') {
            specs.dates.start = new Date(specs.dates.start + y1, m1, 1);
            specs.dates.end = new Date(specs.dates.end + y2, m2, d2);
        }else if (typeof specs.dates.start === 'string'){
            specs.dates.start = new Date(specs.dates.start);
            specs.dates.end = new Date(specs.dates.end);
        }
        return new Struct(parentEntry, specs, x, type, f, full, parentType);
    }

    constructor(values = undefined, specs, x = undefined, type = "avg", f, full = false, parentType) {
        this.full = full;
        this.specs = specs;
        this.specs.parentType = parentType;
        this.f = f;
        this.x = x;
        this.type = type;
        this.parentType = parentType;
        this.movAvg = undefined;
        this.VALUES = {};
        this.BASELINE = {};
    }

    set entry(value) {
        this.POINT = value;
    }

    get subDivide() {
        let specs = JSON.parse(JSON.stringify(this.specs));
        specs.keys.shift();
        return curl.proxRequest(specs, false, specs.keys[0]);
    }

    get entry() {
        if (this.POINT === undefined) {
            let specs = JSON.parse(JSON.stringify(this.specs));
            specs.subType = this.type;
            this.POINT = Point.build(specs, this.full).then(point => {
                if (this.full) {
                    switch (this.type) {
                        case "avg":
                        case "max":
                        case "min":
                        case "sum":
                            break;
                        case "number":
                            if (typeof this.f == 'function' && this.values[0] instanceof Point) {
                                this.values = this.values.then(value => value.filter(this.f));
                            }
                            this.Y = this.values.then(value => value.length);
                            break;
                        case 'first':
                        case 'last':
                            if (point instanceof Point) {
                                return point[this.type](this.f);
                            } else {
                                return NaN;
                            }
                        case 'snow':
                        case 'rain':
                            break;
                        case 'low':
                        case 'high':
                            return point[this.type](this.f);
                        default:
                    }
                } else {
                    switch (this.type) {
                        default:
                            return point;
                    }
                }
                if (point.ERROR) {
                    return point.ERROR;
                }
                return point;
            });
        }
        return this.POINT;
    }

    set y(val) {
        this.Y = val;
    }

    get y() {
        try {
            return this.entry.then(point => {
                if (undefined === point) return new Error('no point specified');
                return point.y;
            });
        } catch (error) {
            throw error;
        }
    }

    get count() {
        return this.values.length;
    }

    getValues(genSpecs, k) {
        let f = this.f;
        let key = genSpecs.keys[0];
        let type = this.type;
        let specs = JSON.parse(JSON.stringify(genSpecs));
        specs.x = k;
        switch (key) {
            case "month":
                specs.dates.start = new Date(specs.dates.start).getFullYear();
                specs.dates.end = new Date(specs.dates.end).getFullYear();
                break;
            case "week":
                break;
            case "splitMonth":
                specs.dates.start = new Date(specs.dates.start).getFullYear();
                specs.dates.end = new Date(specs.dates.end).getFullYear();
                break;
            case "DOY":
                specs.dates.start = new Date(this.x, 0, 0).addDays(k);
                specs.dates.end = new Date(this.x, 0, 0).addDays(k + 1);
                break;
            case "year":
                let start = new Date(specs.dates.start);
                let end = new Date(specs.dates.end);
                let kn = k;
                switch (specs.dates.type) {
                    case 'month':
                        switch (specs.dates.month) {
                            case 'dec':
                                kn += 1;
                            default:
                        }
                    case 'spring':
                    case 'autumn':
                    case 'summer':
                        specs.dates.start = new Date(k, start.getMonth(), start.getDate());
                        specs.dates.end = new Date(kn, end.getMonth(), end.getDate());
                        break;
                    case 'winter':
                        specs.dates.start = new Date(k, start.getMonth(), start.getDate());
                        specs.dates.end = new Date(k + 1, end.getMonth(), end.getDate());
                        break;
                    default:
                        specs.dates.start = k;
                        specs.dates.end = k + 1;
                }
                break;
            case 'splitYear':
                specs.dates.start = k;
                specs.dates.end = k;
                return Struct.build(specs, k, type, f, this.full, this.parentType);
            default:
                specs.dates.start = k;
                specs.dates.end = k;
        }
        let result = Struct.build(specs, k, type, f, this.full, this.parentType, this.entry);

        if (this.full) {
            switch (key) {
                case 'year':
                    break;
                default:
                    result.entry = this.entry.then(entry => {
                        return entry.dateSlice(result.specs.dates.start, result.specs.dates.end);
                    });
            }
        }
        return result;
    }

    get values() {
        // TODO handle whne to calculate and when to request calculate
        let genSpecs = JSON.parse(JSON.stringify(this.specs));
        genSpecs.keys.shift();
        switch (this.specs.keys[0]) {
            case 'yrly':
                break;
            default:
        }
        if (genSpecs.keys[0] === undefined) {
            this.VALUES = this.entry;
        } else if (Object.keys(this.VALUES).length === 0) {
            let keys = (new Point(genSpecs))[`${genSpecs.keys[0]}s`];
            this.VALUES = {};
            for (let i = 0; i < keys.length; i++) {
                this.VALUES[keys[i]] = this.getValues(genSpecs, keys[i]);
            }
        }
        return Object.values(this.VALUES);
    }

    get valuesAll() {
        return Struct.build(this.specs, this.x, this.type, this.f, true);
    }

    split(f) {
        if (this.values[0].split) {
            return new Struct(this.values.map(each => each.split(f)), this.x, this.type);
        }
        return new Struct(f(this.values), this.x, this.type);
    }

    filter(f, type = this.type, abs = true) {
        let res = new Struct([], this.x, this.type);
        if (typeof this.values[0].filter == 'function' && abs) {
            res.values = this.values.map(entry => {
                return entry.filter(f, type);
            });
        } else {
            return f(this);
        }
        return res.build(type);
    }

    filterForm(f, type, abs) {
        let g = entry => {
            const y = f(...entry.values.map(each => each.y));
            return {
                subX: entry.values.filter(each => each.y === y).map(each => new Date(each.x)),
                y,
                x: entry.x
            };
        };
        try {
            if (this.values.length > 0 && Array.isArray(this.values[0].values) && abs) {
                return new Struct(this.values.map(each => each.filter(g, type, abs)), this.x, type).build(type);
            }
            return this.filter(g, type, abs);
        } catch (error) {
            throw error;
        }
    }

    get snow() {
        return this.TYPE('snow', undefined, true);
    }

    get rain() {
        return this.TYPE('rain', undefined, true);
    }

    get min() {
        return this.TYPE('min');
    }

    get minAvg() {
        return this.AVGTYPE('minAvg');
    }

    get max() {
        return this.TYPE('max');
    }

    get maxAvg() {
        return this.AVGTYPE('maxAvg');
    }

    get sum() {
        return this.TYPE('sum');
    }

    get first() {
        if (this.type === 'first') this.type = 'min';
        return this.TYPE('first', e => e.y <= 0, true);
    }

    get last() {
        if (this.type === 'last') this.type = 'min';
        return this.TYPE('last', e => e.y <= 0, true);
    }

    extreme(type) {
        return new Extreme(this, type);
    }

    get high() {
        let extreme = this.extreme('high');
        return lim => {
            return extreme.getValue(lim);
        };
    }

    get low() {
        let extreme = this.extreme('low');
        return lim => {
            return extreme.getValue(lim);
        };
    }

    get number() {
        return this.TYPE('number', this.f);
    }

    get baseline() {
        let genSpecs = JSON.parse(JSON.stringify(this.specs));
        let start = new Date(genSpecs.dates.start);
        genSpecs.dates.start = new Date(genSpecs.baseline.start, start.getMonth(), start.getDate());
        let end = new Date(genSpecs.dates.end);
        genSpecs.dates.end = new Date(genSpecs.baseline.end, end.getMonth(), end.getDate());
        let baseline = Struct.build(genSpecs, this.x, this.type, this.f, this.full, this.parentType);
        switch (this.type) {
            case 'first':
            case 'last':
                baseline = baseline[this.type];
                return {
                    y: Promise.all(baseline.shortValues).then(values => {
                        return values.map(each => each.y).reduce((a, b) => a + b) / values.length;
                    })
                };
            case 'minAvg':
            case 'maxAvg':
                return {
                    y: baseline.y.then(y => y.y)
                };
            default:
        }
        return baseline;
    }

    get difference() {
        return this.baseline.y.then(baseline => {
            return this.shortValues.map(value => {
                return value.then(value => {
                    if (value === undefined) return undefined;
                    value.y -= baseline;
                    value.baseline = baseline;
                    return value;
                });
            });
        });
    }

    get growingSeason() {
        return this.TYPE('growingSeason', undefined, true);
    }

    AVGTYPE(type, f) {
        return this.entry.then(entry => {
            let seed = entry.getSeed();
            seed.specs.subType = type;
            seed.specs.parentType = this.type;
            let nEntry = new Point(seed.specs, seed.req);
            return new Struct(nEntry, seed.specs, this.x, type, f, this.full, this.type);
        });
    }

    TYPE(type, f = this.f, full = this.full) {
        let specs = JSON.parse(JSON.stringify(this.specs));
        specs.subType = type;
        if (full === this.full) {
            let res = new Struct(this.VALUES, specs, this.x, type, f, full, this.type);
            res.colored = this.colored;
            res.color = this.color;
            return res;
        } else {
            let res = Struct.build(specs, this.x, type, f, full, this.type);
            res.colored = this.colored;
            res.color = this.color;
            return res;
        }
    }

    numberReq() {
        return this;
    }

    get shortValues() {
        switch (this.specs.keys[0]) {
            case 'all':
                return this.entry.then(entry => {
                    if (entry instanceof Point) {
                        return entry.splinter.map(each => Promise.resolve(each.short));
                    } else {
                        return new Error(`Invalid`);
                    }
                });
            default:
                let length = 25;
                let val = [];
                for (let i = 0; i < length; i++) {
                    val.push(Promise.resolve(true));
                }
                let qLength = length - 1;
                return this.values.reverse().map((value, index) => {
                    let i = index % qLength;
                    val[i] = val[i].then(() => {
                        return new Promise(res => {
                            return res(value.short);
                        });
                    });
                    return val[i].then();
                }).reverse();
        }
    }

    get yValues() {
        return this.shortValues.map(each => each.then(vals => vals.y));
    }

    get short() {
        if (this.typeMeta !== undefined) return this.typeMeta;
        switch (this.type) {
            default:
                return this.entry.then(entry => {
                    try {
                        return entry.short;
                    } catch (error) {
                        throw error;
                    }
                });
        }
    }

    sequence(f = e => e > 0) {
        return Promise.all(this.shortValues).then(values => {
            values = values.map(each => {
                let res = {};
                res.y = f(each.y) ? 1 : 0;
                res.x = this.x;
                res.start = each.x;
                res.end = each.x;
                return res;
            }).filter(each => each.start !== undefined);
            values.unshift([]);
            let sequence = values.reduce((a, b) => {
                if (b.y > 0) {
                    if (a.length > 0) {
                        const i = a.length - 1;
                        if (a[i].y > 0) {
                            a[i].y += b.y;
                            a[i].end = b.end;
                        } else {
                            a.push(b);
                        }
                    } else {
                        a.push(b);
                    }
                } else {
                    a.push(b);
                }
                return a;
            });
            let max = Math.max(...sequence.map(e => e.y));
            if (max === 0) {
                sequence = sequence[0];
                sequence.y = NaN;
                return sequence;
            }
            return sequence.filter(e => e.y === max)[0];
        });
    }

    closest(date) {
        if (typeof date == 'string') date = new Date(date);
        const oneDay = 24 * 60 * 60 * 1000;
        const distance = [];
        this.values.forEach(each => {
            const temp = new Date(each.x);
            const end = new Date(temp.getYear() + 1900, 11, 31);
            const start = new Date(temp.getYear() + 1900, 0, 1);
            const days = Math.round(Math.abs((start - end) / oneDay));
            const degree = 360 / days;
            date = new Date(temp.getYear() + 1900, date.getMonth(), date.getDate());
            const dis = Math.round(Math.abs((date - temp) / oneDay));
            const degrees = dis * degree;
            distance.push(Math.round(degrees / degree));
        });
        const min = Math.min.apply(null, distance);
        const { values } = this;
        const result = {
            data: undefined,
            interval: {
                y: {
                    hi: undefined,
                    lo: undefined
                }
            }
        };
        distance.forEach((value, index) => {
            if (value === min) {
                result.data = values[index];
            }
        });
        return result;
    }

    variance() {
        switch (this.type) {
            case "sum":
                return this.count * variance(this.values.map(each => each.y));
            default:
                return variance(this.values.map(each => each.y));
        }
    }

    ci() {
        return climatePlotsHelper.confidenceInterval(this.y, this.variance(), this.count);
    }

    plotCI() {
        let result = [];
        let e = this.ci();
        let { y } = this;
        this.values.forEach(each => {
            if (each.ci) {
                e = each.ci();
                y = each.y;
            }
            result.push({
                x: each.x,
                high: e.high + (each.y - y),
                low: e.low + (each.y - y)
            });
        });
        return result;
    }

    get movingAverages() {
        let mov = 5;
        return this.shortValues.reduce((all, current) => {
            current = current.then(value => {
                value.yReal = value.y;
                delete value.y;
                value.all = [];
                return value;
            });
            all.push(current.then());
            let middle = all.length - (mov % 2 + 1);
            if (middle < 0) {
                return all;
            }
            if (middle + mov % 2 > mov % 2 && middle >= 0) {
                let worker = all[middle].then();
                for (let i = middle - mov % 2; i <= middle + mov % 2; i++) {
                    let worker = all[i].then();
                    all[middle] = all[middle].then(value => {
                        return worker.then(cur => {
                            value.all.push(cur.yReal);
                            return value;
                        });
                    });
                }
            }
            return all;
        }, []).map(promise => {
            return promise.then(value => {
                if (value.all.length >= mov) {
                    value.y = value.all.reduce((a, b) => a + b) / value.all.length;
                }
                return value;
            });
            return promise;
        });

        if (this.movAvg !== undefined) {
            return this.movAvg;
        }
        let movAvg = movingAverages(this.values.map(each => each.y), 10);
        let result = [];
        let variance = this.variance();
        let { count } = this;
        this.values.forEach((each, index) => {
            if (each.variance) {
                variance = each.variance();
            }
            if (each.count) {
                count = each.count;
            }
            const e = climatePlotsHelper.confidenceInterval(movAvg[index], variance, count);
            result.push({
                y: movAvg[index],
                x: each.x,
                high: e.high,
                low: e.low
            });
        });
        return result.slice(10);
    }

    plotMovAvgCI() {
        if (this.movAvg === undefined) {
            this.movAvg = this.plotMovAvg();
        }
        return this.movAvg;
    }

    linReg() {
        const result = regression.linear(this.values.map((each, index) => [index, each.y]));
        result.linReg.points = values.map((each, index) => [each.x, result.linReg.points[index][1]]);
        return result;
    }

    reInit(type = this.type, lower = baselineLower, upper = baselineUpper, color) {
        this.type = type;
        this.color = color;
        this.specs.baseline.start = lower;
        this.specs.baseline.end = upper;
        if (this.values.length > 0) {
            if (this.values[0].keys) {
                this.keys = this.values[0].keys;
            } else {
                this.keys = Object.keys(this.values[0]);
            }
        }
        this.values = this.values.sort((a, b) => a.x - b.x);
        return this;
    }

    Axis(key) {
        let keys = Object.values(this.values).map(each => each[key]);
        keys = keys.filter((element, i) => i === keys.indexOf(element));
        const result = {};
        keys.forEach(each => {
            result[each] = this.values.filter(entry => each === entry[key]);
        });
        return result;
    }

    clone() {
        return new Struct(this.values, this.x, this.type);
    }

    map(F) {
        return new Struct(F(this.values), this.x, this.type);
    }
};
