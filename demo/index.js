
/*global require*/
require([
	"esri/map",
	"agolUtils"
], function (esriMap, agolUtils) {
	var map;

	/**
	 * Adds one or more layers to the map.
	 * @param {(external:esri/layers/layer|external:esri/layers/layer[])} layerOrLayers - Either a single layer or an array of layers..
	 */
	function addLayersToMap(layerOrLayers) {
		if (Array.isArray(layerOrLayers)) {
			layerOrLayers.forEach(function (layer) {
				map.addLayer(layer);
			});
		} else {
			map.addLayer(layerOrLayers);
		}
	}

	map = new esriMap("map", {
		basemap: "topo",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	agolUtils.getOperationalLayers("webmap.json").then(addLayersToMap, function (error) {
		console.error(error);
	});
});