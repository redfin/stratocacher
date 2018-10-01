import Layer from "../layer-class";
import Q     from "q";
import _     from "lodash";

export const CACHE = {};

export default class LayerTestObject extends Layer {
	static reset() {
		_.forEach(CACHE, (v, k) => delete CACHE[k])
	}

	get() {
		return Q(this.load(CACHE[this.key]));
	}

	set(val) {
		CACHE[this.key] = this.dump(val);
	}
}
