import Q from "q";
import {DynamoDB} from "aws-sdk";
import {Layer, events} from "stratocacher";

var CLIENTS = {};

class Client {
	constructor(awsConfig) {
		const ddbClient = new DynamoDB(awsConfig);
		this.getItem = Q.nbind(ddbClient.getItem, ddbClient);
		this.putItem = Q.nbind(ddbClient.putItem, ddbClient);
	}
}

function emitError(message) {
	events.emit("error", {
		name: "LayerDynamo",
		error: new Error(message),
	});
}
/*
	DynamoDB Caching Layer.
	Uses AWS-SDK Dynamo client: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
	Configuration requires a table name corresponding to Dynamo configuration.
	Your table must look like this:

	field:  type:
	key     String
	v       String
	t       Number
	i       Boolean
*/
export default class LayerDynamo extends Layer {

	constructor(options) {
		super(options);
		if (!this.opt.tableName) {
			emitError("Must provide tableName");
		}
		if (!this.opt.awsConfig) {
			emitError("Must provide awsConfig");
		}
	}

	parseValue(val) {
		if (this.opt.json === false) {
			return val;
		}
		return JSON.parse(val);
	}

	getClient() {
		if (!CLIENTS[this.cid]) {
			CLIENTS[this.cid] = new Client(this.opt.awsConfig);
		}
		return CLIENTS[this.cid];
	}

	get() {
		return this.getClient()
			.getItem(this.makeDDBGetParams(this.key))
			.then((response) => {
				if (response && response.Item) {

					const {Item} = response;

					this.load({
						key: Item.key.S,
						v: this.parseValue(Item.v.S),
						t: Number(Item.t.N),
						i: Item.i.BOOL,
					});
				}
			});
	}

	set(val) {
		return this.getClient().putItem(this.makeDDBPutParams(this.key, val));
	}

	makeDDBGetParams(key) {
		return {
			Key: {
				key: {
					S: String(key),
				},
			},
			TableName: this.opt.tableName,
		};
	}

	makeDDBPutParams(key, val) {
		const {v, t, i} = this.dump(val);
		return {
			Item: {
				key: {
					S: String(key),
				},
				v: {
					S: this.opt.json === false ? String(v) : JSON.stringify(v),
				},
				t: {
					N: String(t), //Dynamo requires numbers be sent as strings
				},
				i: {
					BOOL: Boolean(i),
				},
			},
			TableName: this.opt.tableName,
		};
	}
}
