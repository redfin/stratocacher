const wrap = require('../lib/wrap').default;
const Registry = require('../lib/registry').default;

describe("The wrap function", () => {

	afterEach(() => {
		Registry.clear();
	});

	it("requires a named function", () => {
		const unnamed = () => {
			wrap(function(){});
		}
		expect(unnamed).toThrowError("Need a named function!");
	});

	it("only accepts a name once", () => {
		const named = () => {
			wrap(function A(){});
		}
		expect(named).not.toThrow();
		expect(named).toThrowError("Cache name collision!");
	});
});
