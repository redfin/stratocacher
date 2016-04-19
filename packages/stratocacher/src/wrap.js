import _ from "lodash";
import Q from "q";
import events from "./events";
import {makeKey} from "./keys";
import Registry from "./registry";
import LayerConfiguration from "./layer-configuration";

import {
	DEFAULT_TTL,
	DEFAULT_TTR_RATIO,
} from "./constants";

export default function wrap(opts, func){

	// Accept arguments in either order.  They're necessarily different
	// types, so whatever's nicer for callers.
	if (typeof opts === 'function') {
		[opts, func] = [func, opts];
	}

	// This also means we can accept _no opts_ as all defaults.
	// Not really useful, but a fine degenerate case.
	if (typeof opts === 'undefined') {
		opts = {};
	} else {
		opts = _.clone(opts);
	}

	if (!opts.name) opts.name = func.name;

	if (!opts.name) throw new Error("Need a name or a named function!");

	// Really don't want collisions.
	if (Registry.has(func.name)) {
		throw new Error("Cache name collision!");
	}


	const {
		name,
		ttl     = DEFAULT_TTL,
		ttr     = ttl * DEFAULT_TTR_RATIO,
		layers  = [],
		before  = _ => Q(_),   // Munge arguments.
		after   = _ => Q(_),   // Munge response.
		force   = () => false, // Force a miss.
	} = opts;

	const time = (type, time) => events.emit('time', {type, name, time});

	// Bind configuration at wrap time.
	layers.forEach((l, i) => {
		if (!(l instanceof LayerConfiguration)) {
			layers[i] = l.configure();
		}
	});

	// Find a value in the cache or build it if it's not there.
	// Make sure the cache gets and stays populated along the way.
	const lookup = function(_t0, args, keys) {
		const key = keys && makeKey(opts, keys);
		const lay = layers.map(l => l.instantiate({key, ttl, ttr}));
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

		const pump = () => {

			// Get the next layer.
			const cur = lay.shift();
			const _t1 = new Date;

			// If we couldn't make a key, then we force a miss.
			// If we're out of layers, then we'll just have to
			// build.  It's a full miss.
			// We can _force_ a miss with the `_bust` parameter.
			if (!key || !cur || force()) {
				bld().then(val => {

					// Hand it off.
					ret.resolve(val)

					// Sob about it.
					time('miss', new Date - _t0);

				// Patch rejection through to return promise.
				}).catch(err => ret.reject(err));
				return;
			}

			Q().then(() => cur.get()).then(() => {

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
			.then(v => (time('overall', new Date - _t0), v))
	}

	let unwrapped = false;
	const wrapped = function() {
		if (unwrapped) {
			return func.apply(this, arguments);
		}
		const arg = Array.from(arguments);
		const key = arg.slice();
		const _t0 = new Date;
		const ret = Q.defer();
		const run = keys => lookup.call(this, _t0, arg, keys)
			.then(v => ret.resolve(v))
			.catch(e => ret.reject(e))

		const nop = error => {
			// If the `before` hook fails, we'll proceed
			// with caching disabled.
			events.emit('error', {name, error});
			run(null);
		}

		Q(key)
			.then(before)
			.then(keys => keys
				?run(keys)
				:nop(new Error("before returned falsy"))
			, nop);

		return ret.promise;
	}

	// Un-cache.  Return the original function.  Disable caching in our
	// original return value.  Free up the function name for future
	// caching.
	wrapped.unwrap = function(){
		unwrapped = true;
		Registry.del(name);
		return func;
	}

	wrapped.isWrapped = () => !unwrapped;

	Registry.add(name, wrapped);

	return wrapped;
}
