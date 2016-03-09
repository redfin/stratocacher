import _ from "lodash";

const CACHES = {}

export default class Registry {

	static has(name) {
		return CACHES.hasOwnProperty(name);
	}

	static add(name, cache) {
		if (Registry.has(name)){
			throw new Error("Registry collision!");
		}
		if (typeof cache.unwrap !== 'function') {
			throw new Error("Registry is for caches!");
		}
		CACHES[name] = cache;
	}

	static del(name) {
		if (!CACHES[name].isUnwrapped()) {
			throw new Error("Must unwrap to unregister!");
		}
		delete CACHES[name];
	}

	// Really just for testing.
	// Unwraps all wrapped functions and clears the registry.
	static clear() {
		_.forEach(CACHES, cache => cache.unwrap());
	}
}
