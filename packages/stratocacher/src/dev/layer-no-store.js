import Layer from "../layer-class";
import Q     from "q";

export default class LayerNoStore extends Layer {
	get() { return Q() }

	set() { }
}
