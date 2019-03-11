import {GLOBAL_VERSION} from "./constants";
import events from "./events";

export function makeKey({
	name,
	version,
}, args){
	const pieces = [
		GLOBAL_VERSION,
		name,
		version || 0,
		...args,
	]
	for (let i = 0; i < pieces.length; i++){
		if (
			typeof pieces[i] !== 'string' &&
			typeof pieces[i] !== 'number'
		){
			const error = new Error(
				`Bad key component (${pieces[i]})`
			);
			events.emit('error', {name, error});
			return null;
		}
	}
	return JSON.stringify(pieces);
}
