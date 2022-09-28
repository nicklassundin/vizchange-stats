// const help = require("./../helpers.js");
const help = require('climate-plots-helper')

/*
 * Const { JSDOM } = require( "jsdom" );
 * let { window } = new JSDOM( "" );
 * const $ = require( "jquery" )( window );
 */
const {Point} = require('./point.js')


function ColorToHex(color) {
    let hexadecimal = color.toString();
    return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
}

function getDateOfWeek(w, y) {
    var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}
//function ConvertRGBtoHex(red, green, blue) {
//	return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
//}


module.exports = class Struct {
    static build(seedSpecs, x, type, f = () => true, full = false, parentType, parentEntry) {
        let specs = JSON.parse(JSON.stringify(seedSpecs));
        let y1 = 0;
        let y2 = 1;
        let m1 = 0;
        let d1 = 1;
        let m2 = 0;
        let d2 = 0;
        //console.log('seedSpecs:', seedSpecs.keys)
        //console.log('struct.static build:', specs.keys, x)
        switch (specs.delimiter) {
            case 'month':
                y2 = 0;
                m1 = help.months().indexOf(x);
                m2 = help.months().indexOf(x) + 1;
                break;
            case 'week':
                specs.dates.start = getDateOfWeek(seedSpecs.x, (new Date(specs.dates.start)).getFullYear())
                specs.dates.end = specs.dates.start.addDays(7)
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
            case 'dec':
                y2 = 0;
                m1 = help.months().indexOf(specs.delimiter);
                m2 = m1+1;
                break;
            case 'spring':
                m1 = 3;
                m2 = 6;
                y2 = 0;
                break;
            case 'summer':
                m1 = 6;
                m2 = 9;
                y2 = 0;
                break;
            case 'autumn':
                m1 = 9;
                m2 = 12;
                y2 = 0;
                break;
            case 'winter':
                m1 = 12;
                m2 = 3;
                y2 = 1;
                break;
            case 'decades':
                y2 = 10;
                break;
            case '30period':
                y1 = -1;
                y2 = 30;
                m1 = 7
                m2 = 7
                break;
            case 'splitMonth':
            //    console.log('x',x)
             //   y1 = (x < 12) ? + -1 : 0;
              //  y2 = 0;
               // m1 = (x > 12) ? x -12 : x
               // m2 = (x > 12) ? x -12 : x
               // break;
            case 'monthly':
                break;
            case 'yrlySplit':
                y1 = -1;
                y2 = 0;
                m1 = 7
                m2 = 7
                break;
            default:
        }
        if (typeof specs.dates.start === 'number') {
            specs.dates.start = new Date(specs.dates.start + y1, m1, 1)
            specs.dates.end = new Date(specs.dates.end + y2, m2, d2)
        }
        if (typeof specs.dates.end === 'string') {
            specs.dates.start = new Date(specs.dates.start)
            specs.dates.end = new Date(specs.dates.end)
        }
     //   console.log('after:', specs.dates)
        return new Struct(parentEntry, specs, x, type, f, full, parentType)
    }
    constructor(values = undefined, specs, x = undefined, type = "avg", f, full = false, parentType ) {
        this.full = full;
        this.specs = specs;
        this.specs.parentType = parentType;
        //this.VALUES = values;
        this.f = f;
        this.x = x;
        this.type = type
        this.parentType = parentType
        this.movAvg = undefined;
        this.VALUES = {};

    }
    set "entry"(value) {
        this.POINT = value
    }
    get "entry"() {
        if (this.POINT === undefined) {
            let specs = JSON.parse(JSON.stringify(this.specs));
            specs.subType = this.type
            this.POINT = Point.build(specs, this.full).then(point => {
                if (this.full) {
                    switch (this.type) {
                        case "difference":
                            throw new Error("Not implemented")
                        case "avg":
                        case "max":
                        case "min":
                        case "sum":
                            break;
                        case "number":
                            if (typeof this.f == 'function' && this.values[0] instanceof Point) {
                                // TODO check if works could be array of promises
                                this.values = this.values.then((value) => value.filter(this.f))
                            }
                            this.Y = this.values.then((value) => value.length);
                            break;
                        case 'first':
                        case 'last':
                            point = point[this.type];
                            break;
                        case 'snow':
                        case 'rain':
                            break;
                        default:
                    }
                } else {
                    switch (this.type) {
                        case "difference":
                            return point.difference
                        default:
                            return point
                    }

                }
                if (point.ERROR) {
                    return point.ERROR
                }
                return point
            })
        }
        return this.POINT
    }

    set "y"(val) {
        this.Y = val;
    }

    get "y"() {
        try{
        return this.entry.then(point => {
            if(undefined === point) return new Error('no point specified')
            return point.y
        })

        }catch(error){
            throw error
        }
    }

    get "count"() {
        return this.values.length
    }

    /**
     set "point" (val){
		this.POINT.push(val)
	}
     get "point" (){
		return this.POINT[0]
	}*/
    getValues(genSpecs, key, k, type, f, full) {
        let specs = JSON.parse(JSON.stringify(genSpecs))
        specs.x = k;
        switch (key) {
            case "month":
                specs.delimiter = k
                specs.dates.start = new Date(specs.dates.start).getFullYear()
                specs.dates.end = new Date(specs.dates.end).getFullYear()
                break;
            case "week":
                specs.delimiter = key
                break;
            case "splitMonth":
                specs.delimiter = key;
                specs.dates.start = new Date(specs.dates.start).getFullYear()
                specs.dates.end = new Date(specs.dates.end).getFullYear()
                break;
            default:
                specs.dates.start = k;
                specs.dates.end = k;
        }
        let result = Struct.build(specs, k, type, f, full, specs.parentType);
       // console.log(result)
       // values[k] = Struct.build(specs, k, type, f, full, specs.parentType, this.entry.then(e => e.outside(specs)));
        return result
    }
    get "values"() {
        // TODO remove embededed promises
        let genSpecs = JSON.parse(JSON.stringify(this.specs));
        let key = genSpecs.keys.shift();
        let type = this.type;
        let f = this.f;
        let full = this.full;
        let parentType = this.specs.parentType;
        if(key === undefined){
            this.VALUES = this.entry;
        }else if(Object.keys(this.VALUES).length == 0) {
            let keys = (new Point(genSpecs))[`${key}s`]
            this.VALUES = {}
            //console.log(`${key}s`, keys)
            for(let i = 0; i < keys.length; i++) {
                this.VALUES[keys[i]] = this.getValues(genSpecs, key, keys[i], type, f, full, parentType)
            }
        }
        return Object.values(this.VALUES).map(each => {
            if (each instanceof Error) {
                return Promise.reject(each)
            } else {
                return Promise.resolve(each)
            }
        })
    }

    get "valuesAll"() {
        return Struct.build(this.specs, this.x, this.type, this.f, true)
    }

    "split"(f) {
        if (this.values[0].split) {
            return new Struct(
                this.values.map((each) => each.split(f)),
                this.x,
                this.type
            )
        }
        return new Struct(
            f(this.values),
            this.x,
            this.type
        );
    }

    "filter"(f, type = this.type, abs = true) {
        let res = new Struct([], this.x, this.type)
        if (typeof this.values[0].filter == 'function' && abs) {
            res.values = this.values.map((entry) => {
                return entry.filter(
                    f,
                    type
                );
            });
            // return value;
        } else {
            return f(this)
        }
        return res.build(type)

    }
    "filterForm"(f, type, abs) {
        let g = (entry) => {
            const y = f(...entry.values.map((each) => each.y));
            return {
                "subX": entry.values.filter((each) => each.y === y).map((each) => new Date(each.x)),
                y,
                "x": entry.x
            };

        };
        try {
            if (this.values.length > 0 && Array.isArray(this.values[0].values) && abs) {
                return new Struct(this.values.map((each) => each.filter(
                    g,
                    type,
                    abs
                )), this.x, type).build(type);

            }

            // return this.filter(g,type,abs)
            return this.filter(
                g,
                type,
                abs
            )
        } catch (error) {
            throw error
        }

    }
    get "snow" () {
        return this.TYPE('snow', undefined, true)
    }
    get "rain" () {
        return this.TYPE('rain', undefined, true)
    }
    get "min"() {
        return this.TYPE('min');
    }

    get "minAvg"() {
        return this.AVGTYPE('minAvg');
    }

    get "max"() {
        return this.TYPE('max');
    }

    get "maxAvg"() {
        return this.AVGTYPE('maxAvg');
    }

    get "sum"() {
        return this.TYPE('sum');
    }

    get "first"() {
        return this.TYPE('first', (e) => e <= 0, true)
    }

    get "last"() {
        return this.TYPE('last', (e) => e.y <= 0, true)
    }

    get "number"() {
        return this.TYPE("number", this.f)
    }

    get "difference"() {
        return this.TYPE("difference", this.f)
    }

    "AVGTYPE"(type, f) {
        return this.entry.then((entry) => {

            let seed = entry.getSeed();
            seed.specs.subType = type;
            seed.specs.parentType = this.type
            // for standard for entry in Struct
            let nEntry = new Point(seed.specs, seed.req)
            return new Struct(nEntry, seed.specs, this.x, type, f, this.full, this.type)
        })

        // return res
        // let res = new Struct([], this.x, type)
        // res.values = this.values.map(each => each.short())
        // return res.build(type)
    }

    "TYPE"(type, f = this.f, full = this.full) {
        let specs = JSON.parse(JSON.stringify(this.specs));
        specs.subType = type;
        if (full === this.full) {
            let res = new Struct(this.VALUES, specs, this.x, type, f, full, this.type)
            res.colored = this.colored;
            res.color = this.color;
            return res
        } else {
            let res = Struct.build(specs, this.x, type, f, full, this.type)
            res.colored = this.colored;
            res.color = this.color;
            return res
        }
        // if(!(this.values[0] instanceof Point) && typeof this.values[0].TYPE === 'function'){
        // res.values = this.values.map(each => each.TYPE(type))
        // }else{
        // res.values = this.values;
        // }
        // return res.build(type)
    }

    "numberReq"() {
        return this;
    }

    get "shortValues"() {
        return this.values.map(each => {
            return each.then(vals => vals.short())
        })
    }

    get "yValues"() {
        return this.shortValues.map(each => each.y)
    }
    "short"() {
        if (this.typeMeta !== undefined) return this.typeMeta
        return this.y.then(y => {
            return {
                compressed: true,
                y: y,
                x: this.x,
                colors: {
                    red: ColorToHex(255, 55 + Math.floor(y * 200 / (this.y - y)), 0),
                    blue: ColorToHex(55 + Math.floor(y * 200 / (this.y - y)), 255, 0)
                },
                type: this.type,
                xInterval: this.xInterval,
                typeMeta: this.typeMeta,
                date: (this.values.length === 1 ? this.values[0].short().date : null),
            }
        })
    }
    "occurrence"(type) {
        return (val) => {
            var f = type;
            if (typeof f != 'function') {
                switch (type) {
                    case 'high':
                        f = (e) => e.y > val
                        break;
                    case 'low':
                        f = (e) => e.y < val
                        break;
                    default:
                }
            }
            this.f = f;
            return this.number
        }
    }

    "sequence"(f = (e) => e > 0) {

        const values = this.values.map((each) => {

                const res = {};
                this.keys.forEach((key) => {

                    res[key] = each[key];

                });
                res.y = f(each.y)
                    ? 1
                    : 0;
                res.x = this.x;
                res.start = each.x;
                res.end = each.x;
                return res;

            }),
            max = values.reduce(
                (a, b) => {

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

                },
            );

        /*
         * Console.log(max)
         * Fsdfsd
         */
        let res = new Struct(
            [],
            this.x,
            'max'
        )
        res.values = max;
        return res.build("max");

    }

    "variance"() {

        switch (this.type) {

            case "sum":
                return this.count * variance(this.values.map((each) => each.y));
            default:
                return variance(this.values.map((each) => each.y));

        }

    }

    "ci"() {

        return help.confidenceInterval(
            this.y,
            this.variance(),
            this.count
        );

    }

    "plotCI"() {

        let result = [],
            e = this.ci(),
            {y} = this;
        this.values.forEach((each) => {

            if (each.ci) {

                e = each.ci();
                y = each.y;

            }
            result.push({
                "x": each.x,
                "high": e.high + (each.y - y),
                "low": e.low + (each.y - y)
            });

        });
        return result;

    }

    "closest"(date) {
        if (typeof date == 'string') date = new Date(date)
        const oneDay = 24 * 60 * 60 * 1000,
            distance = [];
        this.values.forEach((each) => {

            const temp = new Date(each.x),
                end = new Date(
                    temp.getYear() + 1900,
                    11,
                    31
                ),
                start = new Date(
                    temp.getYear() + 1900,
                    0,
                    1
                ),
                days = Math.round(Math.abs((start - end) / oneDay)),
                degree = 360 / days;
            date = new Date(
                temp.getYear() + 1900,
                date.getMonth(),
                date.getDate()
            );
            const dis = Math.round(Math.abs((date - temp) / oneDay)),
                degrees = dis * degree;
            // If(degrees > 180) degrees = 360 - degrees;
            distance.push(Math.round(degrees / degree));

        });
        const min = Math.min.apply(
                null,
                distance
            ),
            {values} = this,
            result = {
                "data": undefined,
                "interval": {
                    "y": {
                        "hi": undefined,
                        "lo": undefined
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

    "plotMovAvg"() {

        if (this.movAvg !== undefined) {

            return this.movAvg;

        }
        let movAvg = movingAverages(
                this.values.map((each) => each.y),
                10
            ),
            result = [],
            variance = this.variance(),
            {count} = this;
        this.values.forEach((each, index) => {

            if (each.variance) {

                variance = each.variance();

            }
            if (each.count) {

                count = each.count;

            }
            const e = help.confidenceInterval(
                movAvg[index],
                variance,
                count
            );
            result.push({
                "y": movAvg[index],
                "x": each.x,
                "high": e.high,
                "low": e.low
            });

        });
        return result.slice(10);

    }

    "plotMovAvgCI"() {

        if (this.movAvg === undefined) {

            this.movAvg = this.plotMovAvg();

        }
        return this.movAvg;

    }

    "linReg"() {

        const result = regression.linear(this.values.map((each, index) => [
            index,
            each.y
        ]));
        result.linReg.points = values.map((each, index) => [
            each.x,
            result.linReg.points[index][1]
        ]);
        return result;

    }
/*
    "changeY"(type) {
        let specs = JSON.parse(JSON.stringify(this.specs));
        specs.type = type;
        specs.dates.start = new Date(specs.dates.start)
        specs.dates.end = new Date(specs.dates.end)

                let entry = this.entry.then()
                entry = entry.then((entry) => {
                    return entry.changeY(type)
                })
                return new Struct(entry, specs, this.x, this.type, this.f, this.full, this.parentType)
    }

 */
    "reInit"(type = this.type, lower = baselineLower, upper = baselineUpper, color) {
        this.type = type;
        // TODO use color
        this.color = color;
        // TODO insert lower and upper values
        this.specs.baseline.start = lower;
        this.specs.baseline.end = upper;
        // END
        if (this.values.length > 0) {
            if (this.values[0].keys) {
                this.keys = this.values[0].keys;
            } else {
                this.keys = Object.keys(this.values[0]);
            }
        }
        this.values = this.values.sort((a, b) => {
            return a.x - b.x
        })
        // const max = Math.max(...this.values.map((each) => each.y));
        // this.values = this.values.map((each) => {

        // 	switch (color) {

        // 		case "red":
        // 			each.color = `rgb(255,${255 - Math.floor(each.y * 255 / max)}, 0)`;
        // 			break;
        // 		case "blue":
        // 			each.color = `rgb(${
        // 				255 - Math.floor(each.y * 255 / max)},${
        // 					255 - Math.floor(each.y * 255 / max)},${
        // 						255})`;

        // 			break;
        // 		case "green":
        // 			each.color = `rgb(${255 - Math.floor(each.y * 255 / max)},255, 0)`;
        // 			break;
        // 		default:
        // 			return each;
        // }

        // });
        return this;
    }

    "Axis"(key) {
        let keys = Object.values(this.values).map((each) => each[key]);
        keys = keys.filter((element, i) => i === keys.indexOf(element));
        const result = {};
        keys.forEach((each) => {

            result[each] = this.values.filter((entry) => each === entry[key]);

        });
        return result;

    }

    "clone"() {
        return new Struct(this.values, this.x, this.type)

    }

    "map"(F) {
        return new Struct(F(this.values), this.x, this.type)
    }

    get "xInterval"() {
        // TODO
        // let x1 = new Date(Math.min.apply(
        // null,
        // this.values.map((each) => (each.xInterval
        // 	? Math.min.apply(
        // 		null,
        // 		each.xInterval
        // 	)
        // 	: new Date(each.x)))
        // )).getTime();
        // let x2 = new Date(Math.max.apply(
        // null,
        // this.values.map((each) => (each.xInterval
        // 	? Math.max.apply(
        // null,
        // each.xInterval
        // )
        // : new Date(each.x)))
        // )).getTime();
        // return {
        // x: x1,
        // x2: x2
        // }
    }
};
// exports.struct = struct;

// exports.parseByDate = require("./parseByDate.js").parseByDate;
