import _ from "lodash";
import Q from "q";
import events from "./events";
import {makeKey} from "./keys";

import {
	DEFAULT_TTL,
	DEFAULT_TTR_RATIO,
} from "./constants";

const CACHES = {};

export default function wrap(opts, func){
	if (!func.name) throw new Error("Need a named function!");

	// Really don't want collisions.
	if (CACHES[func.name]) {
		throw new Error("Cache name collision!");
	}
	CACHES[func.name] = true;

	opts = _.clone(opts);

	// Module and function.
	// (and a color for logging).
	opts.name  = func.name;

	const {
		name,
		ttl     = DEFAULT_TTL,
		ttr     = ttl * DEFAULT_TTR_RATIO,
		layers  = [],
		before  = _ => Q(_),   // Munge arguments.
		after   = _ => Q(_),   // Munge response.
		extra   = () => [],    // Extra key components.
		force   = () => false, // Force a miss.
	} = opts;

	const time = (type, time) => events.emit('time', {type, name, time});

	// Find a value in the cache or build it if it's not there.
	// Make sure the cache gets and stays populated along the way.
	const lookup = function(_t0, args) {
		const key = makeKey(opts, Array.from(args), extra());
		const lay = layers.map(layer => new layer({key, ttl, ttr}));
		const fix = lay.slice();
		const ret = Q.defer();
		const bld = () => {
			const _t1 = new Date;
			return Q()
				.then(() => func.apply(this, args))
				.then(val => {
					time('build', new Date - _t1);
					return val;
				});
		}

		// If we couldn't make a key, then we can't cache.
		if (!key) return Q(bld());

		const pump = () => {

			// Get the next layer.
			const cur = lay.shift();
			const _t1 = new Date;

			// If we're out of layers, then we'll just have to
			// build.  It's a full miss.
			// We can _force_ a miss with the `_bust` parameter.
			if (!cur || force()) {
				bld().then(val => {

					// Hand it off.
					ret.resolve(val)

					// Sob about it.
					time('miss', new Date - _t0);

				// Patch rejection through to return promise.
				}).catch(err => ret.reject(err));
				return;
			}

			cur.get().then(() => {

				// If we found a value and it's not expired.
				if (cur.val && !cur.exp) {

					// Hand it off.
					ret.resolve(cur.val);

					// Brag about it.
					time('hit', new Date - _t0);
					time(`layer.${cur.name()}.hit.fromStart`,  new Date - _t0);
					time(`layer.${cur.name()}.hit.individual`, new Date - _t1);

					// If our time-to-rebuild has elapsed,
					// we'll rebuild in the background and
					// populate the new value into all
					// layers.
					if (cur.red) {
						bld().then(val => {
							fix.forEach(l => {
								l.set(val);
							});
						}).catch(() => {
							time('error.background', new Date - _t0);
						});

					}
				} else {

					// Miss.  Populate this layer later
					// when we get a value.
					ret.promise.then(val => cur.set(val));

					time(`layer.${cur.name()}.miss.fromStart`,  new Date - _t0);
					time(`layer.${cur.name()}.miss.individual`, new Date - _t1);

					// Try the next layer.
					pump();
				}
			});
		}

		// Start looking!
		pump();

		// Log if we reject.
		ret.promise.catch(() => time('error.returned', new Date - _t0));

		// We'll find it, we promise!
		return ret.promise

			// Post-processing on the way out of the cache.
			.then(after)

			// Down and to the right!
			.then(() => time('overall', new Date - _t0))
	}

	return function() {
		const _t0 = new Date;
		return Q(before(Array.from(arguments)))
			.then(args => lookup.call(this, _t0, args));
	}
}
