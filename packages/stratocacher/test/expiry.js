const Q = require('q');
const wrap = require('../lib/wrap').default;
const Registry = require('../lib/registry').default;
const LayerTestObject = require('../lib/dev/layer-test-object').default;
const {ONE_HOUR} = require('../lib/constants');

describe("Cache value expiry", () => {

	beforeEach(() => {
		Registry.clear();
		LayerTestObject.reset();
		jasmine.clock().install().mockDate();
	});

	afterEach(() => {
		jasmine.clock().uninstall();
	});

	it("causes a miss", done => {
		let i = 0;

		const A = wrap({
			ttl    : ONE_HOUR,
			layers : [LayerTestObject],
		}, function A() {
			return ++i;
		})

		// No arguments.
		const get = () => A()

		Q()
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => jasmine.clock().tick(ONE_HOUR/2))
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => jasmine.clock().tick(ONE_HOUR))
		.then(get)
		.then(v => expect(v).toBe(2))
		.then(done)
	});

});
