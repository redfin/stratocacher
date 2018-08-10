const mockRequire = require("mock-require");
const cache = {};

mockRequire("store", {
	get: (key) => cache[key],
	set: (key, val) => (cache[key] = val),
});

const LayerLocalStorageObject = require("../lib/index.js").default;

describe("A LayerLocalStorageObject instance", () => {

	it("sets and gets a value", done => {
		const obj = { foo: "bar" }

		const layer = new LayerLocalStorageObject({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toBe(obj);
			done();
		});
	});
});
