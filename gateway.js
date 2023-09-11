
//let libcurl = require('node-libcurl');
//const { Curl } = libcurl;
// const { Curl, libcurl } = 
// const WaitNotify = require('wait-notify');
// const waitNotify = new WaitNotify();
// const host = `staging-devop-deploy-vischange.k8s.glimworks.se/data/query/v1`;
// let local_debug = `localhost/debug/data/query/v1/test`;
// const host = `vischange.k8s.glimworks.se/data/query/v1`;
//
// TODO local cache should be available
//const cached_list = require('./debug/list.js')


hashCode = function(s) {
	let h = 0, l = s.length, i = 0;
	if ( l > 0 )
		while (i < l)
			h = (h << 5) - h + s.charCodeAt(i++) | 0;
	return h;
};

const preset = {
	stationTypes: {
		abisko: ['temperature, precipitation', 'growingSeason','snowdepth_single', 'decadeMeans', 'periodMeans', 'perma'],
		umea: ['temperature, precipitation', 'growingSeason'],
		pavlopetri: ['temperature, precipitation', 'growingSeason','snowdepth_single', 'decadeMeans', 'periodMeans', 'perma'],
		glob: ['glob','co2_weekly'],
		nhem: ['nhem_temp'],
		'64n-90n': ['64n-90n_temp'],
		'tornetrask': ['freezeup,breakup'],
		'heliport': ['freezeup,breakup'],
		'katterjokk': ['freezeup,breakup'],
		'kursflaket': ['freezeup,breakup'],
		'lakta': ['freezeup,breakup'],
		'mellanflaket': ['freezeup,breakup'],
		'narkevaere': ['freezeup,breakup'],
		'storflaket': ['freezeup,breakup'],
		'bergfors': ['freezeup,breakup'],
	},
	// radious: 'radius=500000',
	radious30: 'radius=30',
	station: {
		abisko: '?position=18.8166,68.3538&radius=30',
		pavlopetri: '?position=22.98865,36.51698&radius=30',
		glob: '?position=22.98865,36.51698&radius=30',
		nhem: '?position=22.98865,36.51698&radius=30',
		'calm': '?position=18.33333333,68.4263889&radius=300000',
		'64n-90n': '?position=22.98865,36.51698&radius=30',
		'tornetrask': '?position=19.723333333333333,68.22555555555556&radius=30',
		'heliport': '?position=18.795555555555556,68.3644444&radius=30',
		'katterjokk': '?position=18.1747222222222,68.4252778&radius=30',
		'kursflaket': '?position=18.878333333333334,68.3513889&radius=30',
		'lakta': '?position=18.33333333,68.4263889&radius=30',
		'mellanflaket': '?position=18.964166666667,68.3480556&radius=30',
		'narkevaere': '?position=19.76583333333,68.1977778&radius=30',
		'storflaket': '?position=18.96527777778,68.3475&radius=30',
		'bergfors': '?position=19.762777777778,68.1455556&radius=30',
		get 'umea'() {
			return preset.station['140480']+'&radius=10000'
		}
		// '': ['?position='],
	},
	types: {
		//temperature: 'temperature,avg_temperature,min_temperature,max_temperature',
		temperature: 'avg_temperature,min_temperature,max_temperature',
		precipitation: 'precipitation,avg_temperature',
		snow: 'precipitation,avg_temperature',
		rain: 'precipitation,avg_temperature',
		growingSeason: 'temperature',
		perma: 'perma',
		lakeice: 'icetime',
		'breakup': 'freezeup,breakup',
		'freezeup': 'freezeup,breakup',
		'snowdepth_single': 'snowdepth_single',
		'decadeMeans': 'snowdepth_single',
		'periodMeans': 'snowdepth_single',
		'co2': 'co2_weekly',
		'globtemperature': 'glob_temp',
		'nhemtemperature': 'nhem_temp',
		'64n-90ntemperature': '64n-90n_temp',
	}
}

module.exports = {
	async get(url){
		if(this.cached[url] === undefined){
			// TODO nicer solution to individual requests
			this.cached[url] = axios.get(url).then(result => {
				this.number += 1;
				if(result && result.data) result = result.data
				if(Array.isArray(result)){
					result = result.map(each => {
						Object.keys(each).forEach(key => {
							switch (key) {
								case 'position':
								case 'station':
								case 'date':
									break;
								default:
									if(typeof each[key] === 'string'){
										each[key] = each[key].replace(',', '.')
									}
							}
						})
						return each
					})
				}
				return result
			}).catch(
				function (error) {
					//console.log('Show error notification!', error)
					return Promise.reject(error)
				}
			)
		}
		return this.cached[url]
	},
}

