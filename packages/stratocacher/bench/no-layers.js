const wrap = require('../lib/wrap').default;

const get = wrap({}, function get(){ return true });
suite('no layers', () => {
	bench('get', next => get().then(next));
});
