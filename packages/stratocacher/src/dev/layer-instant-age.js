import LayerTestObject from "./layer-test-object";

export default class LayerInstantAge extends LayerTestObject {
	dump(val) {
		val = super.dump(val);
		val.t -= this.opt.by;
		return val;
	}
}
