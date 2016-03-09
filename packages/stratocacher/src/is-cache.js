export default function isCache(val) {
	return (
		typeof val.unwrap    === 'function' &&
		typeof val.isWrapped === 'function'
	);
}
