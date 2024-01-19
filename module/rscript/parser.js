const {WebR} = require('webr');
const {Point} = require('../point');

class Parser {
    constructor (data, request){
        console.log('DataLength:', data.length)
        this.data = this.initData(data);
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
    async get (type, y, calc) {
        return this.getMatch(type, y, calc).then((df) => {
            // NOTE / TODO this should be a callback function to R script library
            //return this.cbind(df.values[0].values, df.values[1].values);
            return this.cbind(df);
        });
    }
    async getMatch (type, y, calc) {
        await this.initR(type);
        return (await this.getCol(type, y, calc)).toJs();
    }
    getName(type, tag){
        if(tag === this.xLabel){
            return tag;
        }
        return `${type}_${tag}`;
    }
    getData(type, tag){
        return this.data[type][tag]
    }
    async initR(type) {
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        for (const tag in this.data[type]) {
            await this.webR.objs.globalEnv.bind(this.getName(type, tag), this.getData(type, tag))
        }
        this.dataframe[type] = await this.createDataFrame(type, Object.keys(this.data[type]));
    }
    createDataFrame(type, tags) {
        return this.webR.evalR(`df <- data.frame(${tags.map(tag => this.getName(type, tag)).join(',')})
        colnames(df) <- c("${tags.join('","')}") 
        df <- df[order(df$${this.xLabel.join(',df$')}),]
        return(df)`)
    }
    async getCol (type, tag, calc, df = this.getDf(type)) {
        switch (calc) {
            case 'ma': /* TODO moving average */
                return this.webR.evalR(`stats::filter(${this.getName(type, tag)}[order(${this.getName(type, this.xLabel)})], rep(1,5), sides = 1)/5`);
            case 'snow':
                // TODO
                return this.webR.evalR(`mapply(function (x) (abs(x) - x) / (2 * abs(x)), avg_temperature)*precipitation`).catch(err => console.log(err))
            case 'max':
            case 'min':
            default:
                return this.webR.evalR(`return(df[c("${tag}","${this.xLabel.join('","')}")])`, {df: this.getDf(type)});
        }
    }
    async evalR(code, type) {
        return await this.webR.evalR(code, { df: this.getDf(type) });
    }
    getDf(type) {
        return this.dataframe[type]
    }
    async cbind () {
        let df = arguments[0]
        return df.values[0].values.map((each, i) => {
            return new Point(Object.keys(df.values).map((key, j) => df.values[j].values[i]), df.names)
        })
    }
    get xLabel () {
        return this.request.label;
    }
}
module.exports.Parser = Parser;
class ParserRaw extends Parser {
    constructor (data, request) {
        super(data, request);
        this.dataframe = [];
        this.frameSlice = 1000;
        this.dataframeGroups = Array.from({ length: this.data.date.length/this.frameSlice }, (value, index) => index);
        this.dataframeGroups = this.dataframeGroups.map(g => {
            return {
                start: g*this.frameSlice,
                end: (this.frameSlice > this.data.date.length) ? this.data.date.length : (g+1)*this.frameSlice
            }
        })
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
    async initR(type) {
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        let div = this.frameSlice;
        for (const g of this.dataframeGroups) {
            for (const tag of Object.keys(this.data)) {
                let data = this.getData(tag);
                let end = (g.end > data.length) ? data.length : g.end;
                await this.webR.objs.globalEnv.bind(this.getName(type, tag), data.slice(g.start, end))
            }
            this.dataframe.push(await this.createDataFrame(type, Object.keys(this.data)));
        }
    }
    getName(type, tag){
        return tag;
    }
    getData(type){
        return this.data[type]
    }
    getDf () {
        return this.dataframe[1]
    }
    async getCol (type, tag, calc) {
        let call = (options) => {
            switch (calc) {
                case 'ma':
                case 'snow':
                case 'max':
                case 'min':
                default:
                    return this.webR.evalR(`return(df[c("${type}","${this.xLabel.join('","')}")])`, options);
            }
        }
        return this.dataframe.map(frame => call({df: frame}))[0]
    }
    get xLabel () {
        return ['date']
    }
}
module.exports.ParserRaw = ParserRaw;
