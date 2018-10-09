const Q = require('q');
const wrap = require('../lib/wrap').default;
const events = require('../lib/events').default;
const Registry = require('../lib/registry').default;
const LayerTestObject = require('../lib/dev/layer-test-object').default;
const CACHE = require('../lib/dev/layer-test-object').CACHE;
const {ONE_HOUR} = require('../lib/constants');

describe("An unwrapped function", () => {

	afterEach(() => {
		Registry.clear();
		LayerTestObject.reset();
		events.removeAllListeners();
	});

	it("updates value and ceases events", done => {
		let i = 0;

		const handler = jasmine.createSpy('handler');

		events.on('time', handler);

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
		.then(() => expect(handler).toHaveBeenCalled())
		.then(() => handler.calls.reset())
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(handler).toHaveBeenCalled())
		.then(() => handler.calls.reset())
		.then(A.unwrap)
		.then(get)
		.then(v => expect(v).toBe(2))
		.then(() => expect(handler).not.toHaveBeenCalled())
		.then(done);

	});

	it("accepts a transform hook", done => {
		const data0 = {foo: 0, bar: 1};
		const handler = jasmine.createSpy('handler');
		const transform = jasmine.createSpy('transform');
		events.on('time', handler);

		const A = wrap({
			ttl         : ONE_HOUR,
			layers      : [LayerTestObject],
			transform : (val) => {
				transform();
				return val.foo === 1 ? undefined : Object.assign(val, {baz: 2});
			},
		}, function A() {
			return Object.assign(data0, {foo: ++data0.foo});
		})

		// No arguments.
		const get = () => A()

		Q()
			.then(get)
			.then(v => expect(v).toBe(data0))
			.then(() => expect(handler).toHaveBeenCalled())
			.then(() => expect(transform).toHaveBeenCalled())
			.then(() => expect(Object.keys(CACHE).length).toBe(0))
			.then(() => handler.calls.reset())
			.then(get)
			.then(v => expect(v.foo).toBe(2) && expect(v.baz).toBe(2))
			.then(() => expect(CACHE['0_A_0'].v.baz).toBe(2))
			.then(() => expect(handler).toHaveBeenCalled())
			.then(() => expect(transform).toHaveBeenCalled())
			.then(done);
	});

	it("can be re-wrapped", done => {
		const handler = jasmine.createSpy('handler');

		events.on('time', handler);

		wrap({}, wrap({}, function A() {}).unwrap())().then(() => {
			expect(handler).toHaveBeenCalled();
			done();
		});
	});
});
