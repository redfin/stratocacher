import Q from "q";
import {DynamoDB} from "aws-sdk";
import {Layer} from "stratocacher";

/*
	DynamoDB Caching Layer.
	Uses AWS-SDK Dynamo client: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
	Configuration requires a table name, key field name, and value field name corresponding to
	Dynamo table configuration.
*/
export default class LayerDynamo extends Layer {

	static configure(config) {
		super.configure(config);

		if (!config.cacheTableName) {
			throw new Error("Must provide tableName");
		}
		if (!config.cacheKeyFieldName) {
			throw new Error("Must provide cacheKeyFieldName");
		}
		if (!config.cacheValueFieldName) {
			throw new Error("Must provide cacheValueFieldName");
		}
		if (!config.awsConfig) {
			throw new Error("Must provide config.awsConfig");
		}

		this.cacheTableName = config.cacheTableName;
		this.cacheKeyFieldName = config.cacheKeyFieldName;
		this.cacheValueFieldName = config.cacheValueFieldName;
		this.client = new DynamoDB(config.awsConfig);
	}

	getClient() {
		if (!LayerDynamo.client) {
			throw new Error("AWS-SDK not initialized. Call LayerDynamo#configure before using this layer.")
		}

		return LayerDynamo.client;
	}

	get() {
		return Q.nfcall(this.getClient().getItem, this.makeDDBGetParams(this.key))
			.then(this.load);
	}

	set(val) {
		return Q.nfcall(this.getClient().putItem, this.makeDDBPutParams(this.key, this.dump(val)));
	}

	makeDDBGetParams(key) {
		const ddbKey = {};
		ddbKey[LayerDynamo.cacheKeyFieldName] = {S: key};
		return {
			Key: ddbKey,
			TableName: LayerDynamo.cacheTableName,
		};
	}

	makeDDBPutParams(key, val) {
		const ddbItem = {};
		ddbItem[LayerDynamo.cacheKeyFieldName] = {S: key};
		ddbItem[LayerDynamo.cacheValueFieldName] = {S: val};

		return {
			Item: ddbItem,
			TableName: LayerDynamo.cacheTableName,
		};
	}
}
