import LayerConfiguration from "./layer-configuration";

export default class Layer {
	constructor({
		key,
		ttl,
		ttr,
		opt,
	}) {
		this.key = key;
		this.ttl = ttl || false;
		this.ttr = ttr || false;
		this.opt = opt || LayerConfiguration.global(this.constructor);
		this.cid = getConfigId(this);
		this.reset();
	}

	static configure(opt) {
		return new LayerConfiguration(this, opt);
	}

	static reset() {
		while (CONFIG.length) CONFIG.pop();
	}

	name() {
		return this.constructor.name;
	}

	reset() {
		delete this.val;
		delete this.exp;
		delete this.red;
		delete this.age;
		this.now = +new Date;
	}

	dump(val) {
		return {
			'v': val,
			't': this.now,
		}
	}

	load(val) {
		if (typeof val === 'undefined') return;
		this.age = this.now - val.t;
		this.exp = this.ttl && this.age > this.ttl;
		this.red = this.ttr && this.age > this.ttr;
		this.val = this.exp?undefined:val.v;
	}
}

const CONFIG = [];
function getConfigId(layer) {
	const {opt} = layer;
	let cid = CONFIG.reduce((m,v,k) => (v === opt)?k:m, null);
	if (cid === null) {
		cid = CONFIG.length;
		CONFIG[cid] = opt;
	}
	return cid;
}
