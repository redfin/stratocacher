# Stratocacher

A cache with pluggable layers.

## Key features

### Pluggable layers

Want to cache in memcached with a small in-memory LRU cache for hot values?

No problem!  Stratocacher supports pluggable layers, and creating new layers is easy!

### Automatic key generation

Stratocacher works on any function that:
- Is _named_ (e.g. `function foo()`)
- Takes only string and number arguments
- Returns a JSON-serializable value or a _promise_ of a JSON-serializable value.

### Background rebuild

Stratocacher supports separate time-to-live and time-to-rebuild.

If a request comes in between `ttr` and `ttl` then a _background_ rebuild will
kick off and update the cache.  No miss!

## Usage

```javascript

import * as stratocacher from "stratocacher"
import LayerObject from "stratocacher-layer-object"

const getFoo = stratocacher.wrap({
	ttl: stratocacher.constants.ONE_HOUR,
	layers: [
		LayerObject,
	],
}, function getFoo(a, b, c) {
	return promiseOfSomethingExpensive(a, b, c);
});
```

## wrap options

The `wrap` function accepts a number of options.

```javascript
stratocacher.wrap(options, namedFunction);
```

### ttl

Time to live for cache values.

### ttr

Time to _rebuild_ for cache values.
