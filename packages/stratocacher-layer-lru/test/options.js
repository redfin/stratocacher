const LayerLRU = require("../lib/index.js").default;
const Q = require("q");

describe("A LayerLRU instance", () => {
	const obj = { foo: "bar" }

	afterEach(() => {
		LayerLRU.reset();
	});

	it("stashes copies by default", done => {

		const layer = new LayerLRU({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).not.toBe(obj);
			expect(layer.val).toEqual(obj);
			done();
		});
	});

	it("stashes references when configured not to copy", done => {

		LayerLRU.configure({copy: false});

		const layer = new LayerLRU({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toBe(obj);
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
