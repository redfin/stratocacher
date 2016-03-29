import {Layer} from "stratocacher";
import localStorage from "store";

import Q from "q";

export default class LocalStorage extends Layer {

	static reset() {
		super.reset();
		localStorage.forEach((key) => {
			localStorage.remove(key);
		});
	}

	get() {
		let val = localStorage.get(this.key);
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
		localStorage.set(this.key, val);
		return Q(); // We're synchronous but need to return a promise.
	}
}
