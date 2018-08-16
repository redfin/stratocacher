import {getNamespace} from "request-local-storage";
import {Layer} from "stratocacher";
import Q from "q";

const RLS = getNamespace();
/*
	Layer that uses request-local-storage as the cache backing.
	See: https://www.npmjs.com/package/request-local-storage
*/
export default class LayerRLS extends Layer {

	get() {
		const val = RLS()[this.key];
		this.load(val);
		return Q();
	}

	set(val) {
		val = this.dump(val);
		RLS()[this.key] = val;
		return Q();
	}
}
