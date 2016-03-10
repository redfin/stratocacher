# LayerLRU

A cache layer for stratocacher backed by [lru-cache](https://github.com/isaacs/node-lru-cache).

## Options

The following [lru-cache options](https://github.com/isaacs/node-lru-cache#options) are supported:

- `max` The maximum size of the cache.  By default `max` _items_ will be
  stored.  Use the `size` option to instead store `max` _bytes_ (only
  available with `copy`). Not setting this is kind of silly, since that's the
  whole purpose of this lib, but it defaults to `Infinity`.

- `dispose` Function that is called on items when they are dropped from the
  cache. This can be handy if you want to close file descriptors or do other
  cleanup tasks when items are no longer accessible. Mostly only makes sense
  when `copy` is false. Called _only_ with `value`.  This is different from
  `lru-cache`, which calls with `key, value`.  Stratocacher keys are not
  exposed.

The following options affect the behavior of `LayerLRU` itself, and arenn't
passed through to `lru-cache`:

- `copy` Always return a _deep copy_ of values from the cache.  Default is
  `true`.  Set to `false` to cache _by reference_ (use care).

- `size` Store `max` _bytes_ instead of `max` _items_.  Not available when
  `copy` is set to `false`.
