import Q from "q";
import {DynamoDB} from "aws-sdk";
import {Layer} from "stratocacher";

var client, awsConfig, tableName;

class Client {
	constructor(awsConfig) {
		const ddbClient = new DynamoDB(awsConfig);
		this.getItem = Q.nbind(ddbClient.getItem, ddbClient);
		this.putItem = Q.nbind(ddbClient.putItem, ddbClient);
	}
}

function getClient() {
	if (!client) {
		client = new Client(awsConfig);
	}
	return client;
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

	static configure(config) {
		if (!config.tableName) {
			throw new Error("Must provide tableName");
		}
		if (!config.awsConfig) {
			throw new Error("Must provide awsConfig");
		}
		awsConfig = config.awsConfig;
		tableName = config.tableName;

		return super.configure(config);
	}

	get() {
		return getClient()
			.getItem(this.makeDDBGetParams(this.key))
			.then(({Item}) => {
				if (!Item) {
					throw new Error("Malformed response from dynamoDB for key: " + this.key);
				}
				return this.load({
					key: Item.key.S,
					v: Item.v.S,
					t: Number(Item.t.N),
					i: Item.i.BOOL,
				});
			});
	}

	set(val) {
		return getClient().putItem(this.makeDDBPutParams(this.key, val));
	}

	makeDDBGetParams(key) {
		return {
			Key: {
				key: {
					S: String(key),
				},
			},
			TableName: tableName,
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
					S: String(v),
				},
				t: {
					N: String(t), //Dynamo requires numbers be sent as strings
				},
				i: {
					BOOL: Boolean(i),
				},
			},
			TableName: tableName,
		};
	}
}
