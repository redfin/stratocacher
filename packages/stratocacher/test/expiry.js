const Q = require('q');
const wrap = require('../lib/wrap').default;
const events = require('../lib/events').default;
const Registry = require('../lib/registry').default;
const LayerTestObject = require('../lib/dev/layer-test-object').default;
const {ONE_HOUR, ONE_MINUTE} = require('../lib/constants');

describe("Cache value expiry", () => {

	beforeEach(() => {
		jasmine.clock().install().mockDate();
	});

	afterEach(() => {
		Registry.clear();
		LayerTestObject.reset();
		jasmine.clock().uninstall();
		events.removeAllListeners();
	});

	it("causes a miss", done => {
		let i = 0;

		const spies = jasmine.createSpyObj('spies', [
			'build', 'hit', 'miss',
		]);

		events.on('time', v => spies[v.type] && spies[v.type]());

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
		.then(() => expect(spies.miss).toHaveBeenCalled())
		.then(() => jasmine.clock().tick(ONE_HOUR/2))
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(spies.hit).toHaveBeenCalled())
		.then(() => jasmine.clock().tick(ONE_HOUR))
		.then(get)
		.then(v => expect(v).toBe(2))
		.then(() => expect(spies.miss).toHaveBeenCalledTimes(2))
		.then(done)
	});

	it("can be avoided with background rebuild", done => {
		let i = 0;

		const spies = jasmine.createSpyObj('spies', [
			'build', 'hit', 'miss',
		]);

		events.on('time', v => spies[v.type] && spies[v.type]());

		const A = wrap({
			ttl    : ONE_HOUR,
			ttr    : ONE_MINUTE,
			layers : [LayerTestObject],
		}, function A() {
			return ++i;
		})

		// No arguments.
		const get = () => A()

		Q()
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(spies.miss).toHaveBeenCalled())
		.then(() => spies.miss.calls.reset())
		.then(() => jasmine.clock().tick(2*ONE_MINUTE))
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(spies.hit).toHaveBeenCalled())
		.then(() => expect(spies.build).toHaveBeenCalled())
		.then(get)
		.then(v => expect(v).toBe(2))
		.then(() => expect(spies.miss).not.toHaveBeenCalled())
		.then(done)
	});
});
