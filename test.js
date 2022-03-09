const parser = require('./module.js')
global.climateplots = {
	dev: true
}
let cache = {}
cache.result = parser.temperature({
	type: 'temperature',
	station: 'abisko',
	'start': 1970,
	'end': 1973,
	'url': 'vischange.k8s.glimworks.se/data/query/v1'
}).then((res)=> { 
	console.log(res) 
})
