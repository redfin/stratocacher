import lzutf8 from "lzutf8";
import mockRequire from "mock-require";

let cache = {};

//Dynamo client mock
function DynamoDB() {
	this.getItem = (params, cb) => {
		try {
			const key = params.Key.key.S;
			const tableName = params.TableName;
			const Item = cache[tableName] && cache[tableName][key];
			cb(undefined, Item ? {Item} : undefined);
		} catch (e) {
			cb(e);
		}
	}

	this.putItem = (params, cb) => {
		try {
			const key = params.Item.key.S;
			const tableName = params.TableName;

			if (!cache[tableName]) cache[tableName] = {};
			cache[tableName][key] = params.Item
			cb();
		} catch (e) {
			cb(e);
		}
	}
}

mockRequire("aws-sdk", {DynamoDB});

describe("A LayerDynamo instance", () => {
	const obj = {foo: "bar"};
	var LayerDynamo;

	beforeAll(() => {
		LayerDynamo = require("../lib/index.js").default;
		LayerDynamo.configure({
			tableName: "cache",
			awsConfig: {
				accessKeyId: "xxxx",
				secretAccessKey: "xxxx",
				region: "us-west-2",
			},
		});
	});

	beforeEach(() => {
		cache = {}
	})

	it("sets and gets a value", done => {
		const layer = new LayerDynamo({key: "A"});

		layer.set(obj)
			.then(() => layer.get())
			.then(() => {
				expect(layer.val).toEqual(obj);
				done();
			})
			.catch(e => done.fail(e));
	});

	it("returns undefined for a cache miss", done => {
		const layer = new LayerDynamo({key: "A"});

		layer.get()
			.then(() => {
				expect(layer.val).toBeUndefined();
				done();
			})
			.catch(e => done.fail(e));
	});

	it("can be configured to not parse JSON", done => {
		LayerDynamo.configure({
			json: false,
			tableName: "cache",
			awsConfig: {
				accessKeyId: "xxxx",
				secretAccessKey: "xxx",
				region: "us-west-2",
			},
		});

		const layer = new LayerDynamo({key: "A"});

		layer.set(obj)
			.then(() => layer.get())
			.then(() => {
				expect(layer.val).toEqual("[object Object]");
				done();
			})
			.catch(e => done.fail(e));
	});

	it("can be configured to use compression", done => {
		LayerDynamo.configure({
			compress: true,
			tableName: "cache",
			awsConfig: {
				accessKeyId: "xxx",
				secretAccessKey: "xxx",
				region: "us-west-2",
			},
		});

		const layer = new LayerDynamo({key: "A"});

		layer.set(obj)
			.then(() => layer.get())
			.then(() => {
				expect(layer.val).toEqual(obj);
				expect(cache.cache.A.v.B).toEqual(lzutf8.compress(JSON.stringify(obj)));
				done();
			})
			.catch(e => done.fail(e));
	});

});
