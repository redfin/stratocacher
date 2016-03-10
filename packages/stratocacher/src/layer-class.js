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
		this.reset();
	}

	static configure(opt) {
		return new LayerConfiguration(this, opt);
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
