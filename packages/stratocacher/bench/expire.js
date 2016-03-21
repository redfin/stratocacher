const wrap = require('../lib/wrap').default;
const LayerInstantAge = require('../lib/dev/layer-instant-age').default;
const _ = require('lodash');

LayerInstantAge.configure({by: 2})

suite('expired values', () => {
	set('mintime', 1000);
	[
		'no', 'one', 'two', 'four', 'eight', 'sixteen',
		'thirty-two', 'sixty-four', 'one hundred twenty-eight',
	].forEach((name, i) => {
		const n = i && 1<<(i-1);
		const func = function(){}
		Object.defineProperty(func, "name", {value: 'expired'+name});
		const wrapped = wrap({
			ttl: 1,
			layers: _.range(n).map(() => LayerInstantAge),
		}, func);
		bench(`${name} layer${n===1?'':'s'}`, n => wrapped().then(n));
	});
});
