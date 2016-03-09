const Registry = require('../lib/registry').default;

describe("The registry", () => {

	beforeEach(() => {
		Registry.clear();
	});

	it("won't accept a non-cache", () => {
		const add = () => {
			Registry.add('A', {});
		}
		expect(add).toThrowError("Registry is for caches!");
	});

	it("won't accept a collision ", () => {
		const add = () => {
			Registry.add('A', {
				unwrap    : () => Registry.del('A'),
				isWrapped : () => false,
			});
		}
		expect(add).not.toThrow();
		expect(add).toThrowError("Registry collision!");
	});

	it("really doesn't like non-caches", () => {
		const add = () => {
			Registry.add('A', {
				unwrap    : () => true, // Should .del()
				isWrapped : () => false,
			});
		}
		const del = Registry.clear;

		expect(add).not.toThrow();
		expect(del).toThrowError("A non-cache snuck in!");

		// It removes anyway.
		expect(Registry.has('A')).toBe(false);
	});
});
