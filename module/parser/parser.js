const {WebR} = require('webr');
const {Point} = require('../point');
const {RscriptHandler, RscriptRawHandler} = require('../rscript-module/handler')

class Parser {
    constructor(data, request) {
        console.log('DataLength:', data.length)
        this.request = request;
        this.dataframe = {};
        this.request.label = [];
        switch (request.sort) {
            case 'week':
                this.request.label.push('week');
            case 'month':
                this.request.label.push('month');
            case 'year':
                this.request.label.push('year');
                break;
            default:
                this.request.label = ['year'];
        }
        console.log(this.request)
        this.data = this.initData(data);
    }
    initData(data) {
        return undefined;
    }
}

class ParserCalc extends Parser {
    constructor(data, request){
        super(data, request);
        this.handler = new RscriptHandler(this.data, this.request);
    }
    initData (data) {
        let structure = data.reduce((a, b) => {
            return {...a, ...b}
        })
        let types = Object.keys(structure)
        let initial = {}
        for (const type of types) {
            initial[type] = {};
            Object.keys(structure[type]).forEach(key => {
                initial[type][key] = []
            })
        }
        data = data.reduce((a, b) => {
            Object.keys(b).forEach(type => {
                Object.keys(structure[type]).forEach(key => {
                    a[type][key].push(b[type][key])
                })
            });
            return a
        }, initial)
        return data;
    }
}
module.exports.ParserCalc = ParserCalc;
class ParserRaw extends Parser {
    constructor (data, request) {
        super(data, request);
        this.handler = new RscriptRawHandler(this.data, this.request);
    }
    initData(data) {
        let startTime = Date.now();
        let entry = data.reduce((a, b) => {
            return {...a, ...b}
        })
        let keys = Object.keys(entry);

        keys.forEach((key) => {
            entry[key] = [];
        })
        this.data = data.map(entry => {
            entry.date = (new Date(entry.date)).getTime();
            return entry
        }).reduce((a, b) => {
            keys.forEach((key) => {
                switch (key) {
                    case 'date':
                        a[key].push(b[key]);
                        break;
                    case 'position':
                    case 'station':
                         a[key].push(b[key]);
                        break;
                    default:
                        a[key].push(Number(b[key]));
                }

            })
            return a
        }, entry)
        return this.data
    }
}
module.exports.ParserRaw = ParserRaw;
