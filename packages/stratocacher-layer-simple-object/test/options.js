const LayerSimpleObject = require("../lib/index.js").default;

describe("A LayerSimpleObject instance", () => {

	afterEach(() => {
		LayerSimpleObject.reset();
	});

	it("stashes references by default", done => {
		const obj = { foo: "bar" }

		const layer = new LayerSimpleObject({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toBe(obj);
			done();
		});
	});

	it("stashes copies when configured to copy", done => {
		const obj = { foo: "bar" }

		LayerSimpleObject.configure({copy: true});

		const layer = new LayerSimpleObject({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).not.toBe(obj);
			expect(layer.val).toEqual(obj);
			done();
		});
	});
});
