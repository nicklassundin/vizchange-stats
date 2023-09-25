// PLACE HOLDER TODO

const R = require('r-integration');

const {WebR} = require('webr');
const {Point} = require('../point');
class Parser {
    constructor (data, request){
        this.initData(data);
        this.request = request;
    }
    initData (data) {
        let structure = data.reduce((a, b) => {
            return {...a, ...b}
        })
        let types = Object.keys(structure)
        let initial = {}
        types.forEach(type => {
            initial[type] = {};
            Object.keys(structure[type]).forEach(key => {
                initial[type][key] = []
            })
        })
        this.data = data.reduce((a, b) => {
            Object.keys(b).forEach(type => {
                Object.keys(structure[type]).forEach(key => {
                    a[type][key].push(b[type][key])
                })
            });
            return a
        }, initial)
    }
    async initR (type, tag) {
        if(!this.webR){
            this.webR = new WebR();
        }
        await this.webR.init();
        // TODO destroy object when used
        await this.webR.objs.globalEnv.bind(`${type}_${tag}`, this.data[type][tag]);
    }
    async getCol (type, tag, calc) {
        switch (calc) {
            case 'ma': /* TODO moving average */
                return this.webR.evalR(`stats::filter(${type}_${tag}[order(${type}_${this.xLabel})], rep(1,5), sides = 1)/5`);
            default:
                return this.webR.evalR(`return(${type}_${tag}[order(${type}_${this.xLabel})])`);
        }
    }
    async cbind (x, y) {
        return x.then((x_r) => {
            return y.then((y_r) => {
                return y_r.map((each, i) => {
                    return {
                        y: each,
                        x: x_r[i]
                    }
                })
            })
        })
    }
    get xLabel () {
        return this.request.sort;
    }
    async getMatch (type, y, calc) {
        await this.initR(type, this.xLabel);
        await this.initR(type, y);
        let x_n = (await this.getCol(type, this.xLabel)).toArray();
        let y_n = (await this.getCol(type, y, calc)).toArray();
        return await this.cbind(x_n, y_n)
    }
    async get (type, y, calc) {
        return this.getMatch(type, y, calc);
    }
}
module.exports.Parser = Parser;
class ParserRaw extends Parser {
    constructor (data) {
        super(data);
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
        //console.log('Data Time: ', Date.now() - startTime)
        this.data = data.reduce((a, b) => {
            Object.keys(b).forEach((key) => {
                switch (key) {
                    case 'date':
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
    async getMatch (type, y, calc) {
        let x_n = (await this.getCol(this.xLabel)).toArray();
        let y_n = (await this.getCol(type, y, calc)).toArray();
        return await this.cbind(x_n, y_n)
    }
    async getCol (type, tag, calc) {
        await this.initR(type);
        switch (calc) {
            case 'ma': /* TODO moving average */
                return this.webR.evalR(`stats::filter(${type}[order(${this.xLabel})], rep(1,5), sides = 1)/5`);
            case 'snow':
                await this.initR('avg_temperature');
                await this.initR('precipitation');
                //return this.webR.evalR(`return(precipitation[order(${this.xLabel})])`);
                return this.webR.evalR(`mapply(function (x) (abs(x) - x) / (2 * abs(x)), avg_temperature)*precipitation`).catch(err => console.log(err))
            default:
                return this.webR.evalR(`return(${type}[order(${this.xLabel})])`);
        }
    }
    async initR (type) {
        if(!this.webR){
            this.webR = new WebR();
            await this.webR.init().catch(err => console.log(err));
        }
        await this.webR.objs.globalEnv.bind(`${type}`, this.data[type]).catch(err => console.error(err))
    }
    get xLabel () {
        return 'date'
    }
}
module.exports.ParserRaw = ParserRaw;
