import {Layer} from "stratocacher";

import Q from "q";

// Be careful with this!
//  * It caches by _reference_ (by default)!
//  * In _never_ evicts!
const CACHE = {};
export default class LayerSimpleObject extends Layer {

	static reset() {
		super.reset();
		Object.keys(CACHE).forEach(k => delete CACHE[k]);
	}

	getCache() {
		return (this.opt.cacheProvider || (() => CACHE))();
	}

	get() {
		let val = this.getCache()[this.key];
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
		this.getCache()[this.key] = val;
		return Q(); // We're synchronous but need to return a promise.
	}
}
