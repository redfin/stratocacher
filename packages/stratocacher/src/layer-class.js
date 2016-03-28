import LayerConfiguration from "./layer-configuration";

export default class Layer {
	constructor({
		key,
		ttl,
		ttr,
		opt,
		inv,
	}) {
		this.key = key;
		this.ttl = ttl || false;
		this.ttr = ttr || false;
		this.inv = inv || false;
		this.cls = this.constructor;
		this.opt = LayerConfiguration.getConfig  (this.cls, opt);
		this.cid = LayerConfiguration.getConfigId(this.cls, opt);
		this.reset();
	}

	static configure(opt) {
		return new LayerConfiguration(this, opt);
	}

	static reset() {
		LayerConfiguration.reset(this);
	}

	name() {
		return this.cls.name;
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
			'i': this.inv,
		}
	}

	load(val) {
		if (typeof val === 'undefined') return;
		this.age = this.now - val.t;
		this.exp = this.ttl && this.age > this.ttl;
		this.red = this.ttr && this.age > this.ttr;
		this.val = this.exp?undefined:val.v;
		this.inv = val.i;
	}
}
