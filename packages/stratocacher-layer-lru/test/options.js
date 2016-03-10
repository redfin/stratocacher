const LayerLRU = require("../lib/index.js").default;
const {LayerConfiguration} = require("stratocacher");
const Q = require("q");

describe("A LayerLRU instance", () => {
	const obj = { foo: "bar" }

	afterEach(() => {
		LayerLRU.reset();
		LayerConfiguration.reset();
	});

	it("stashes references by default", done => {

		const layer = new LayerLRU({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toBe(obj);
			done();
		});
	});

	it("stashes copies when configured to copy", done => {

		LayerLRU.configure({copy: true});

		const layer = new LayerLRU({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).not.toBe(obj);
			expect(layer.val).toEqual(obj);
			done();
		});
	});

	it("calls dispose function when set", done => {

		const dispose = jasmine.createSpy('dispose');

		LayerLRU.configure({dispose, max: 1});

		Q()
		.then(() => new LayerLRU({key: "A"}).set(obj))
		.then(() => new LayerLRU({key: "B"}).set(obj))
		.then(() => expect(dispose).toHaveBeenCalled())
		.then(done)
	});
});
