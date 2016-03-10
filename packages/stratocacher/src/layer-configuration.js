import _ from "lodash";

const GLOBAL = {};
export default class LayerConfiguration {

	static reset(cls) {
		if (cls) {
			delete GLOBAL[cls.name];
		} else {
			_.forEach(GLOBAL, (v, k) => delete GLOBAL[k])
		}
	}

	static global(cls, opt) {
		if (opt) {
			// Global is always newest.
			GLOBAL[cls.name] = Object.freeze(opt);
		} else if (!GLOBAL[cls.name]) {
			GLOBAL[cls.name] = Object.freeze({});
		}
		return GLOBAL[cls.name];
	}

	constructor(cls, opt) {
		this.cls = cls;
		this.opt = LayerConfiguration.global(cls, opt);
	}

	instantiate(arg) {
		const opt = this.opt;
		return new this.cls(_.assign({opt}, arg));
	}
}
