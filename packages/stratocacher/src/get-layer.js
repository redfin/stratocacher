import LayerConfiguration from "./layer-configuration";

export default function(layer) {
	if (layer instanceof LayerConfiguration) {
		return layer.instantiate(this);
	} else {
		return new layer(this);
	}
}
