import {Layer} from "stratocacher";
import localStorage from "store";

import Q from "q";

export default class LocalStorage extends Layer {

	get() {
		let val = localStorage.get(this.key);
		this.load(val);
		return Q(); // We're synchronous but need to return a promise.
	}

	set(val) {
		val = this.dump(val);
		localStorage.set(this.key, val);
		return Q(); // We're synchronous but need to return a promise.
	}
}
