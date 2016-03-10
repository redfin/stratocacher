# LayerLRU

A cache layer for stratocacher backed by [lru-cache](https://github.com/isaacs/node-lru-cache).

## Options

- `max` The maximum number of items in the cache.  Not setting this is kind of
  silly, since that's the whole purpose of this lib, but it defaults to
  `Infinity`.

- `copy` Always return a _deep copy_ of values from the cache.  Default is
  `true`.  Set to `false` to cache _by reference_ (use care).
