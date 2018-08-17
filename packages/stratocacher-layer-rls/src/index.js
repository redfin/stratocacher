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
		let val = RLS()[this.key];
		if (val && this.shouldCopy()) {
			val = JSON.parse(val);
		}
		this.load(val);
		return Q();
	}

	set(val) {
		val = this.dump(val);
		if (this.shouldCopy()) {
			val = JSON.stringify(val);
		}

		RLS()[this.key] = val;
		return Q();
	}

	shouldCopy() {
		return this.opt.copy || !this.opt.hasOwnProperty('copy');
	}
}
