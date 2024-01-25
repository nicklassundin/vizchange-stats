const {WebR} = require('webr');
const {Point} = require('../point');

class Handler {
    constructor(data, request) {
        this.data = data
        this.request = request;
        this.dataframe = undefined;
        this.webR = undefined;
    }
    async get (type, y, calc) {
        return this.getMatch(type, y, calc).then((df) => {
            return this.cbind(df);
        });
    }
    async getMatch (type, y, calc) {
        await this.initR(type);
        return (await this.getCol(type, y, calc)).toJs().then(result => {
            return result
        });
    }
    getDf() {
        return this.dataframe[1];
    }
    async cbind () {
        let df = arguments[0]
        return df.values[0].values.map((each, i) => {
            return new Point(Object.keys(df.values).map((key, j) => df.values[j].values[i]), df.names)
        })
    }
    addDataFrame(type, tags) {
        // NOTE: used for raw data
        return this.webR.evalR(`df2 <- data.frame(${tags.map(tag => this.getName(type, tag)).join(',')})
        colnames(df2) <- c("${tags.join('","')}") 
        df <- rbind(df, df2)
        return(df)`, {df: this.dataframe})
    }
    createDataFrame(type, tags) {
        return this.webR.evalR(`df <- data.frame(${tags.map(tag => this.getName(type, tag)).join(',')})
        colnames(df) <- c("${tags.join('","')}") 
        df <- df[order(df$${this.xLabel.join(',df$')}),]
        return(df)`)
    }
    get xLabel () {
        return this.request.label;
    }
    async initR(type) {}
    async getCol(type, y, calc) {}
}

class RscriptHandler extends Handler {
    constructor (data, request){
        super(data, request)
    }
    async initR(type) {
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        for (const tag in this.data[type]) {
            await this.webR.objs.globalEnv.bind(this.getName(type, tag), this.getData(type, tag))
        }
        this.dataframe = await this.createDataFrame(type, Object.keys(this.data[type]));
    }
    getName(type, tag){
        if(tag === this.xLabel){
            return tag;
        }
        return `${type}_${tag}`;
    }
    getCol (type, tag, calc, df = this.getDf(type)) {
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
    getData(type, tag) {
        return this.data[type][tag];
    }
    async evalR(code, type) {
        return await this.webR.evalR(code, { df: this.dataframe });
    }
}
module.exports.RscriptHandler = RscriptHandler;

class RscriptRawHandler extends Handler {
    constructor(data, request, frameSlice = 1000){
        super(data, request);
        if(this.data.date.length / frameSlice < 1) {
            this.frameSlice = this.data.date.length;
        }else {
            this.frameSlice = frameSlice;
        }
        this.dataframeGroups = Array.from({ length: this.data.date.length/this.frameSlice }, (value, index) => index);
        this.dataframeGroups = this.dataframeGroups.map(g => {
            return {
                start: g*this.frameSlice,
                end: (g+1)*this.frameSlice
            }
        })
        if(this.frameSlice != this.data.date.length) {
            // TODO better solution cleaning up special cases
            this.dataframeGroups.push({
                start: this.dataframeGroups[this.dataframeGroups.length-1].end,
                end: this.data.date.length
            })
        }
    }
    getCol (type, tag, calc) {
        switch (calc) {
            case 'ma':
            case 'snow':
            case 'max':
            case 'min':
            default:
                return this.webR.evalR(`return(df[c("${type}","${this.xLabel.join('","')}")])`, this.dataframe);
        }
    }
    getName(type, tag) {
        // NOTE could be replaced with a if RAW config
        return tag;
    }
    get xLabel () {
        return ['date']
    }
    getData(type, tag) {
        return this.data[type];
    }
    async initR(type) {
        // NOTE could it be generalized? to match both raw and non-raw data
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        let div = this.frameSlice;
        let dataframe;
        for (const g of this.dataframeGroups) {
            for (const tag of Object.keys(this.data)) {
                let data = this.getData(tag);
                await this.webR.objs.globalEnv.bind(this.getName(type, tag), data.slice(g.start, g.end))
            }
            //this.dataframe.push(await this.createDataFrame(type, Object.keys(this.data)));
            if(g.start === 0) {
                dataframe = (await this.createDataFrame(type, Object.keys(this.data)));
            } else {
                dataframe = (await this.addDataFrame(type, Object.keys(this.data)));
            }
        }
        this.dataframe = await dataframe;
        // NOTE dataframe is correct here
    }
}
module.exports.RscriptRawHandler = RscriptRawHandler;
