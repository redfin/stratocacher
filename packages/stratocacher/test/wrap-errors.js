const wrap = require('../lib/wrap').default;

describe("The wrap function", () => {
	it("requires a named function", () => {
		const unnamed = () => {
			wrap({}, function(){});
		}
		expect(unnamed).toThrowError("Need a named function!");
	});
});
