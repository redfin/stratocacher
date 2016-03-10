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

	static global(cls) {
		return GLOBAL[cls.name] || {};
	}

	constructor(cls, opt) {
		this.cls = cls;
		this.setOptions(opt);
	}

	setOptions(opt) {
		if (opt) {
			// Global is always newest.
			GLOBAL[this.cls.name] = opt;
		}
		this.opt = opt || GLOBAL[this.cls.name];
	}

	instantiate(arg) {
		const opt = _.clone(this.opt);
		return new this.cls(_.assign({opt}, arg));
	}
}
