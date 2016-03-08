export default class Layer {
	constructor({
		key,
		ttl,
		ttr,
	}) {
		this.key = key;
		this.now = new Date;
		this.ttl = ttl;
		this.ttr = ttr;
	}

	name() {
		return this.constructor.name;
	}

	dump(val) {
		return {
			'v': val,
			't': this.now,
		}
	}

	load(val) {
		if (typeof val === 'undefined') return;
		this.val = val.v;
		this.age = this.now - val.t;
		this.exp = this.ttl && this.age > this.ttl;
		this.red = this.ttr && this.age > this.ttr;
	}
}
