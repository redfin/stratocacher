const RequestLocalStorage = require('request-local-storage');
const LayerRLS = require("../lib/index.js").default;

describe("A LayerRLS instance", () => {
	const obj = { foo: "bar" }

	it("sets and gets a value", done => {
		RequestLocalStorage.startRequest(() => {
			const layer = new LayerRLS({key: "A"});
			layer.set(obj).then(() => layer.get()).then(() => {
				expect(layer.val).toEqual(obj);
				done();
			});
		});
	});

	it("stashes copies when configured to copy", done => {
		const obj = { foo: "bar" }

		LayerRLS.configure({copy: true});

		RequestLocalStorage.startRequest(() => {
			const layer = new LayerRLS({key: "A"});
			layer.set(obj).then(() => layer.get()).then(() => {
				expect(layer.val).not.toBe(obj);
				expect(layer.val).toEqual(obj);
				done();
			});
		});
	});
});
