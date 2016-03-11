const Q = require('q');
const wrap = require('../lib/wrap').default;
const events = require('../lib/events').default;
const Registry = require('../lib/registry').default;
const _ = require('lodash');

describe("A wrapper", () => {

	const spies = jasmine.createSpyObj('spies', [
		'build', 'miss', 'error', 'A',
	]);

	const expectError = txt => () => {
		expect(expect(spies.error.calls.argsFor(0)[0])
			.toEqual(jasmine.objectContaining({
				name  : 'A',
				error : new Error(txt),
			}))
		);
	}

	beforeEach(() => {
		events.on('time',  v => spies[v.type] && spies[v.type]());
		events.on('error', spies.error);
	});

	afterEach(() => {
		Registry.clear();
		events.removeAllListeners();
		_.forEach(spies, spy => spy.calls.reset());
	});

	it("is bypassed if before throws", done => {
		const A = wrap({
			before: () => { throw new Error("fail") },
		}, function A() { spies.A() })

		Q()
		.then(A)
		.then(() => expect(spies.miss ).toHaveBeenCalled())
		.then(() => expect(spies.build).toHaveBeenCalled())
		.then(() => expect(spies.A    ).toHaveBeenCalled())
		.then(() => expect(spies.error).toHaveBeenCalled())
		.then(expectError('fail'))
		.then(done);
	});

	it("is bypassed if before returns falsy", done => {
		const A = wrap({
			before: () => false,
		}, function A() { spies.A() })

		Q()
		.then(A)
		.then(() => expect(spies.miss ).toHaveBeenCalled())
		.then(() => expect(spies.build).toHaveBeenCalled())
		.then(() => expect(spies.A    ).toHaveBeenCalled())
		.then(() => expect(spies.error).toHaveBeenCalled())
		.then(expectError('before returned falsy'))
		.then(done);
	});

	it("is builds if arg isn't keyable", done => {
		const A = wrap({}, function A() { spies.A() })

		Q()
		.then(() => A({}))
		.then(() => expect(spies.miss ).toHaveBeenCalled())
		.then(() => expect(spies.build).toHaveBeenCalled())
		.then(() => expect(spies.A    ).toHaveBeenCalled())
		.then(() => expect(spies.error).toHaveBeenCalled())
		.then(expectError('Bad key component ([object Object])'))
		.then(done);
	});
});
