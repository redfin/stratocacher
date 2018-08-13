const mockRequire = require("mock-require");
const cache = {};

//Dynamo client mock
function DynamoDB() {
	this.getItem = (params, cb) => {
		const key = params.Key.CacheKey.S;
		const tableName = params.TableName;
		cb(cache[tableName][key]);
	}

	this.putItem = (params, cb) => {
		const key = params.Item.CacheKey.S;
		const val = params.Item.Value.S;
		const tableName = params.tableName;

		if (!cache[tableName]) cache[tableName] = {};

		cb(cache[tableName][key] = val);
	}
}

mockRequire("aws-sdk", {DynamoDB});

describe("A LayerDynamo instance", () => {
	const obj = { foo: "bar" }
	var LayerDynamo;

	beforeAll(() => {
		LayerDynamo = require("../lib/index.js").default;
		LayerDynamo.configure({
			cacheTableName: "my-table",
			cacheKeyFieldName: "CacheKey",
			cacheValueFieldName: "Value",
			awsConfig: {},
		});
	});

	it("sets and gets a value", done => {
		const layer = new LayerDynamo({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toEqual(obj);
			done();
		}).catch(done);
	});

});
