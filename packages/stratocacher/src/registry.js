import _ from "lodash";
import isCache from "./is-cache";

const CACHES = {}

export default class Registry {

	static has(name) {
		return CACHES.hasOwnProperty(name);
	}

	static add(name, cache) {
		if (Registry.has(name)){
			throw new Error("Registry collision!");
		}
		if (!isCache(cache)) {
			throw new Error("Registry is for caches!");
		}
		CACHES[name] = cache;
	}

	static del(name) {
		if (CACHES[name].isWrapped()) {
			throw new Error("Must unwrap to unregister!");
		}
		delete CACHES[name];
	}

	// Really just for testing.
	// Unwraps all wrapped functions and clears the registry.
	static clear() {
		_.forEach(CACHES, cache => {
			try {
				cache.unwrap()
			} catch (e) {
				// Pass.  We'll carp about it later.
			}
		});
		const remaining = Object.keys(CACHES);
		if (remaining.length) {
			remaining.forEach(k => delete CACHES[k]);
			throw new Error("A non-cache snuck in!");
		}
	}
}
