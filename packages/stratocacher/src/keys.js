import {GLOBAL_VERSION} from "./constants";
import events from "./events";

export function makeKey({
	name,
	version,
}, args, extra){
	const pieces = [
		GLOBAL_VERSION,
		name,
		version || 0,
		...args,
		...extra,
	]
	for (let i = 0; i < pieces.length; i++){
		if (
			typeof pieces[i] !== 'string' &&
			typeof pieces[i] !== 'number'
		){
			events.emit('error', `Bad key component (${pieces[i]}) in ${name}`);
			return null;
		}
	}
	return pieces.join('_');
}
