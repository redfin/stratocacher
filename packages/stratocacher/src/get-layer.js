import LayerConfiguration from "./layer-configuration";

export default function(layer, arg) {
	if (!(layer instanceof LayerConfiguration)) {
		layer = new LayerConfiguration(layer);
	}
	return layer.instantiate(arg);
}
