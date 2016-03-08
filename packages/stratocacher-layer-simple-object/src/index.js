import {Layer} from "stratocacher";

import Q from "q";

// Be careful with this!
//  * It caches by _reference_!
//  * In _never_ evicts!
const CACHE = {};
export default class LayerSimpleObject extends Layer {

	get() {
		return Q(this.load(CACHE[this.key]));
	}

	set(val) {
		CACHE[this.key] = this.dump(val);
	}
}
