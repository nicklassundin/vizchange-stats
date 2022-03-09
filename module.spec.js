const parser = require('./module.js')

global.climateplots = {
	dev: true
}
let cache = {}
describe(
	'testing',
	function() {
		// before(async (done) => {
		// 		cache.result = await parser.temperature({
		// 			type: 'yrly',
		// 			station: 'abisko',
		// 			'start': 1970,
		// 			'end': 1973,
		// 			'url': 'vischange.k8s.glimworks.se/data/query/v1'
		// 		}).then((res)=> { console.log(res) }).then(done)
		// 	})
		it('Request', (done) => {
				cache.result = parser.temperature({
					type: 'temperature',
					station: 'abisko',
					'start': 1970,
					'end': 1973,
					'url': 'vischange.k8s.glimworks.se/data/query/v1'
				}).then((res) => {}).then(done)
			})
		// it("test", async (done) => {
		// 		await cache.result.then(() => {
		// 			done()
		// 		})
		// 	})
	}
)
