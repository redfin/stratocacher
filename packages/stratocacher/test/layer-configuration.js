const LayerTestObject = require('../lib/dev/layer-test-object').default;
const LayerConfiguration = require('../lib/layer-configuration').default;

describe("Layer configuration", () => {

	afterEach(() => {
		LayerConfiguration.reset();
	});

	it("is returned by Layer.configure", () => {
		expect(LayerTestObject.configure().constructor.name)
			.toBe('LayerConfiguration');
	});

	it("can instantiate a layer", () => {
		expect(LayerTestObject.configure().instantiate().constructor.name)
			.toBe('LayerTestObject');
	});

	it("gives the layer opts", () => {
		const val = 'foo';
		expect(LayerTestObject.configure({val}).instantiate().opt)
			.toEqual({val});
	});

	it("gives subsequent layers opts", () => {
		const val = 'foo';
		LayerTestObject.configure({val})
		expect(new LayerConfiguration(LayerTestObject).instantiate().opt)
			.toEqual({val});
	});

	it("defaults to undefined opts", () => {
		expect(new LayerConfiguration(LayerTestObject).instantiate().opt)
			.toBeUndefined();
	});
});
