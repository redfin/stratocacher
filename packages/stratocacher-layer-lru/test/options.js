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

	it("evicts when configured with a max", done => {

		LayerLRU.configure({max: 2});

		const l = ['A','B','C']
			.reduce((m,key) => (m[key] = new LayerLRU({key}), m), {});



		Q()

		.then(() => l.A.set(obj))
		.then(() => (l.A.reset(), l.A.get()))
		.then(() => expect(l.A.val).toEqual(obj))

		.then(() => l.B.set(obj))
		.then(() => (l.A.reset(), l.A.get()))
		.then(() => expect(l.A.val).toEqual(obj))
		.then(() => (l.B.reset(), l.B.get()))
		.then(() => expect(l.B.val).toEqual(obj))

		.then(() => l.C.set(obj))
		.then(() => (l.A.reset(), l.A.get()))
		.then(() => expect(l.A.val).toBeUndefined())

		.then(done)
	});
});
