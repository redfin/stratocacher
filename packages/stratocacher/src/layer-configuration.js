import _ from "lodash";

const GLOBAL = {};
const IDS    = {};
export default class LayerConfiguration {

	static reset(cls) {
		if (cls) {
			delete GLOBAL[cls.name];
			delete IDS   [cls.name];
		} else {
			Object.keys(GLOBAL).forEach(k => delete GLOBAL[k]);
			Object.keys(IDS   ).forEach(k => delete IDS   [k]);

		}
	}

	static getConfig(cls, opt) {
		if (opt) {
			// Global is always newest.
			GLOBAL[cls.name] = Object.freeze(opt);
		} else if (!GLOBAL[cls.name]) {
			GLOBAL[cls.name] = Object.freeze({});
		}
		return GLOBAL[cls.name];
	}

	static getConfigId(cls, opt) {
		const name = cls.name;
		const config = IDS[name] || (IDS[name] = []);
		let cid = config.reduce((m,v,k) => (v === opt)?k:m, null);
		if (cid === null) {
			cid = config.length;
			config[cid] = opt;
		}
		return cid;
	}

	constructor(cls, opt) {
		this.cls = cls;
		this.opt = LayerConfiguration.getConfig(cls, opt);
	}

	instantiate(arg) {
		const opt = this.opt;
		return new this.cls(_.assign({opt}, arg));
	}
}
