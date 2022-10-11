const struct = require('./parseByDateStruct.js')
class Baseline {
    constructor(){
        this.cache = {};
    }
    getBaseline(specs){
        //console.log(specs)
        let start = specs.baseline.start;
        let end = specs.baseline.end;
        if(undefined === this.cache[JSON.stringify(specs)]){
            this.cache[JSON.stringify(specs)] = new ByDateStruct(type, undefined, specs)
        }
        return this.cache[JSON.stringify(specs)]
    }
}