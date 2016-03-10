const LayerSimpleObject = require("../lib/index.js").default;
const {LayerConfiguration, constants} = require("stratocacher");
const {ONE_HOUR} = constants;

describe("A LayerSimpleObject entry", () => {

	const obj = { foo: "bar" }

	const layerRef = new LayerSimpleObject({
		key: "A",
		ttl: ONE_HOUR,
	});

	const layerCopy = new LayerSimpleObject({
		key: "A",
		ttl: ONE_HOUR,
		opt: {copy: true},
	});

	beforeEach(() => {
		jasmine.clock().install().mockDate();
	});

	afterEach(() => {
		LayerSimpleObject.reset();
		LayerConfiguration.reset();
		jasmine.clock().uninstall();
		layerRef.reset();
		layerCopy.reset();
	});

	it("is not expired early by reference", done => layerRef
		.set(obj)
		.then(() => layerRef.get())
		.then(() => expect(layerRef.val).toBe(obj))
		.then(() => expect(layerRef.exp).toBe(false))
		.then(done)
	);

	it("is expired after ttl by reference", done => layerRef
		.set(obj)
		.then(() => jasmine.clock().tick(2*ONE_HOUR))
		.then(() => layerRef.reset())
		.then(() => layerRef.get())
		.then(() => expect(layerRef.val).toBe(undefined))
		.then(() => expect(layerRef.exp).toBe(true))
		.then(done)
	);

	it("is not expired early when copied", done => layerCopy
		.set(obj)
		.then(() => layerCopy.get())
		.then(() => expect(layerCopy.val).not.toBe(obj))
		.then(() => expect(layerCopy.val).toEqual(obj))
		.then(() => expect(layerCopy.exp).toBe(false))
		.then(done)
	);

	it("is expired after ttl when copied", done => layerCopy
		.set(obj)
		.then(() => jasmine.clock().tick(2*ONE_HOUR))
		.then(() => layerCopy.reset())
		.then(() => layerCopy.get())
		.then(() => expect(layerCopy.val).toBe(undefined))
		.then(() => expect(layerCopy.exp).toBe(true))
		.then(done)
	);
});
