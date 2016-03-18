const wrap = require('../lib/wrap').default;
const LayerNoStore = require('../lib/dev/layer-no-store').default;
const _ = require('lodash');

suite('misses', () => {
	set('mintime', 1000);
	[
		'no', 'one', 'two', 'four', 'eight', 'sixteen',
		'thirty-two', 'sixty-four', 'one hundred twenty-eight',
	].forEach((name, i) => {
		const n = i && 1<<(i-1);
		const func = function(){}
		Object.defineProperty(func, "name", {value: name});
		const wrapped = wrap({
			layers: _.range(n).map(() => LayerNoStore),
		}, func);
		bench(`${name} layer${n===1?'':'s'}`, n => wrapped().then(n));
	});
});
