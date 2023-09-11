// PLACE HOLDER TODO

const R = require('r-integration');
const {Point} = require('../point');
class Parser {
    constructor (data){
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
    calculate (type, rType) {
        let entries = this.data[type]
        entries.type = rType
        return callMethodAsync("./module/rscript/parser.R", "get", entries).then((result) => {
            result.shift()
            return result.map((entry, i) => new Point(Number(entry), entries.year[i]))
        }).catch((err) => {
            console.error(err)
        });
    }
    raw (rType) {
        let entries = this.data
        entries.type = rType;
        return callMethodAsync("./module/rscript/parser.R", 'get', entries).then((result) => {
            result.shift()
            return result.map((entry, i) => new Point(Number(entry), entries.year[i]))
        }).catch((err) => {
            console.error(err)
        });
    }
}
module.exports.Parser = Parser;
