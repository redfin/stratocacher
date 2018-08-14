const mockRequire = require("mock-require");
const cache = {};

//Dynamo client mock
function DynamoDB() {
	this.getItem = (params, cb) => {
		const key = params.Key.key.S;
		const tableName = params.TableName;
		cb({Item: cache[tableName][key]});
	}

	this.putItem = (params, cb) => {
		const key = params.Item.key.S;
		const tableName = params.tableName;

		if (!cache[tableName]) cache[tableName] = {};

		cb(cache[tableName][key] = params.Item);
	}
}

mockRequire("aws-sdk", {DynamoDB});

describe("A LayerDynamo instance", () => {
	const obj = "xxxx";
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

	it("sets and gets a value", done => {
		const layer = new LayerDynamo({key: "A"});

		layer.set(obj).then(() => layer.get()).then(() => {
			expect(layer.val).toEqual(obj);
			done();
		}).catch(done);
	});

});
