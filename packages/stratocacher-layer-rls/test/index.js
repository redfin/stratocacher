import RequestLocalStorage from "request-local-storage";
import LayerRLS from "../lib/index.js";

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
		const obj = { foo: "bar" };

		setImmediate(() => {
			RequestLocalStorage.startRequest(() => {
				let layer = new LayerRLS(key);
				layer.set(obj);
				layer.get();
				expect(layer.val).toEqual(obj);
				//A new instance with the same key returns obj.
				layer = new LayerRLS(key);
				layer.get();
				expect(layer.val).toEqual(obj);
			});
		});

		setImmediate(() => {
			RequestLocalStorage.startRequest(() => {
				//A new instance with the same key does not return obj
				//this time, because it is scoped to a different request.
				const layer = new LayerRLS(key);
				layer.get();
				expect(layer.val).toBeUndefined();
				done();
			});
		});
	});
});

