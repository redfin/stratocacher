import {getNamespace} from "request-local-storage";
import {Layer} from "stratocacher";
import Q from "q";

function getCache() {
	const rls = getNamespace();
	if (!rls.stratocacher) {
		rls.stratocacher = {};
	}
	return rls.stratocacher;
}

/*
	Layer that uses request-local-storage as the cache backing.
	See: https://www.npmjs.com/package/request-local-storage
*/
export default class LayerRLS extends Layer {

	get() {
		const val = getCache()[this.key];
		this.load(val);
		return Q();
	}

	set(val) {
		val = this.dump(val);
		getCache()[this.key] = val;
		return Q();
	}
}
