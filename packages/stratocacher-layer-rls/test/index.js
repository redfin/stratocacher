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

	it("seperates keys across multiple requests", done => {
		const key = { key: "A" };
		const obj0 = { foo: "bar" };
		const obj1 = { foo: "bar" };

		RequestLocalStorage.startRequest(() => {
			const layer0 = new LayerRLS(key);

			layer0.set(obj0)
				.then(() => layer0.get())
				.then(() => {
					expect(layer0.val).toEqual(obj0);

					RequestLocalStorage.startRequest(() => {
						const layer1 = new LayerRLS(key);
						layer1.set(obj1)
							.then(() => layer0.get())
							.then(() => layer1.get())
							.then(() => {
								expect(layer0.val).toEqual(obj0);
								expect(layer1.val).toEqual(obj1);
								done();
							});
					});
				});
		});
	});
});

