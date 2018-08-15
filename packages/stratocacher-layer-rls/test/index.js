const mockRequire = require("mock-require");

var CACHE = {};

mockRequire("request-local-storage", {
	getNamespace: () => CACHE,
});

const LayerRLS = require("../lib/index.js").default;

describe("A LayerRLS instance", () => {
	const obj = { foo: "bar" }

	it("sets and gets a value", done => {

		const layer = new LayerRLS({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toEqual(obj);
			done();
		});
	});

});
