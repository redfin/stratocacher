import {Layer} from "stratocacher";
import LRU from "lru-cache";

import Q from "q";
import _ from "lodash";

const CACHES = {};
function cache(layer) {
	const {cid, opt} = layer;
	if (!CACHES[cid]) {
		CACHES[cid] = LRU(_.pick(opt, ['max', 'dispose']));
	}
	return CACHES[cid];
}

export default class LayerLRU extends Layer {

	static reset() {
		super.reset();
		Object.keys(CACHES).forEach(k => delete CACHES[k]);
	}

	get() {
		let val = cache(this).get(this.key);
		if (this.opt.copy) {
			val = JSON.parse(val);
		}
		this.load(val);
		return Q(); // We're synchronous but need to return a promise.
	}

	set(val) {
		val = this.dump(val);
		if (this.opt.copy) {
			val = JSON.stringify(val);
		}
		cache(this).set(this.key, val);
		return Q(); // We're synchronous but need to return a promise.
	}
}
