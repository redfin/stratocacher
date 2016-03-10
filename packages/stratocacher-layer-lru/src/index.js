import {Layer} from "stratocacher";
import LRU from "lru-cache";

import Q from "q";

const CACHES = {};
function cache(layer) {
	const {cid} = layer;
	if (!CACHES[cid]) {
		CACHES[cid] = LRU({max: layer.opt.max});
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
		if (val && shouldCopy(this)) {
			val = JSON.parse(val);
		}
		this.load(val);
		return Q(); // We're synchronous but need to return a promise.
	}

	set(val) {
		val = this.dump(val);
		if (shouldCopy(this)) {
			val = JSON.stringify(val);
		}
		cache(this).set(this.key, val);
		return Q(); // We're synchronous but need to return a promise.
	}
}

function shouldCopy(layer){
	const {opt} = layer;
	return opt.copy || !opt.hasOwnProperty('copy');
}
