/*global define*/

/**
 * @external operationalLayer
 * @link {@see http://resources.arcgis.com/en/help/arcgis-rest-api/#/operationalLayer/02r300000049000000/|ArcGIS Rest API - operationalLayer}
 */

/**
 * @external Layer
 * @link {@see http://resources.arcgis.com/en/help/arcgis-rest-api/#/Layer/02r30000004q000000/|ArcGIS Rest API - Layer}
 */

/**
 * @external dojo/Deferred
 * @link {@see http://dojotoolkit.org/reference-guide/1.10/dojo/Deferred.html|dojo/Deferred}
 */

/**
 * @external esri/layers/layer
 * @link {@see https://developers.arcgis.com/javascript/jsapi/layer-amd.html|esri/layers/layer}
 */

/**
 * @external {Object} layerInfoTemplateOptions
 * @link {@see https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#infotemplates|esri/layers/ArcGISDynamicMapServiceLayer.infoTemplates}
 * @property {external:esri/InfoTemplate} infoTemplate
 * @property {string} layerUrl
 * @property {Object} resourceInfo
 */

/**
 * A dictionary of {@link external:layerInfoTemplateOptions} objects keyed by sublayer ID integers.
 * @typedef {Object.<number, external:layerInfoTemplateOptions>} layerInfoTemplateOptionsDictionary
 */

define([
	"dojo/Deferred",
	
	"esri/arcgis/utils",
	"esri/request",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/ArcGISTiledMapServiceLayer",
	"esri/dijit/PopupTemplate"
], function (
	Deferred,

	arcgisUtils,
	esriRequest,
	ArcGISDynamicMapServiceLayer,
	ArcGISTiledMapServiceLayer,
	PopupTemplate
) {
	var exports = {};

	/**
	 * Reads a JSON file containing an {@link external:operationalLayer|operationalLayer} definition.
	 * @param {string} webmapUrl
	 * @returns {external:dojo/Deferred}
	 */
	exports.getOperationalLayers = function (webmapUrl) {
		var deferred = new Deferred(), layer;

		esriRequest({
			url: webmapUrl
		}).then(function (response) {
			try {
				layer = exports.parseOperationalLayers(response.operationalLayers || response);
				deferred.resolve(layer);
			} catch (e) {
				deferred.reject(e);
			}
		}, function (error) {
			deferred.reject(error);
		});

		return deferred;
	};

	/**
	 * Converts an {@link external:operationalLayer}'s "layers" property into
	 * a {@link layerInfoTemplateOptionsDictionary|dictionary of layerInfoTemplateOptions objects}.
	 * keyed by sublayer ID integers.
	 * @param {external:Layer[]} layers
	 * @returns {layerInfoTemplateOptionsDictionary}
	 */
	exports.layersJsonToPopupTemplates = function (layers) {
		var dict;

		layers.forEach(function (layer) {
			var id = layer.id;
			var popupInfo = layer.popupInfo;
			var template;

			if (popupInfo) {
				template = new PopupTemplate(layer.popupInfo);
				if (!dict) {
					dict = {};
				}
				dict[id] = {
					infoTemplate: template
				};
			}
		});

		return dict;
	};

	function operationalLayerToLayer(opLayer) {
		var layer;
		var layerTypeRe = /ArcGIS(?:Tiled)?MapServiceLayer/;
		if (layerTypeRe.test(opLayer.layerType)) {

			var ctor;

			// Get the appropriate constructor for the given layer type.
			switch (opLayer.layerType) {
				case "ArcGISMapServiceLayer":
					ctor = ArcGISDynamicMapServiceLayer;
					break;
				default:
					ctor = ArcGISTiledMapServiceLayer;
					break;
			}

			layer = new ctor(opLayer.url, {
				id: opLayer.id,
				visible: opLayer.visibility,
				opacity: opLayer.opacity,
				title: opLayer.title,
				infoTemplates: opLayer.layers ? exports.layersJsonToPopupTemplates(opLayer.layers) : null
			});

			// If the operationalLayer has an item ID, load its data from AGOL.
			// If there are predefined popups, set the layer's infoTemplates.
			if (opLayer.itemId) {
				arcgisUtils.getItem(opLayer.itemId).then(function (response) {
					if (response && response.itemData && response.itemData.layers) {
						layer.setInfoTemplates(exports.layersJsonToPopupTemplates(response.itemData.layers));
					}
				}, function (error) {
					console.error(error);
				});
			}
		} else {
			throw new Error("Unsupported layer type");
		}
		return layer;
	}

	/**
	 * Parses operationalLayer JSON into a map layer.
	 * @param {(operationalLayer|operationalLayer[])} json
	 * @returns {(external:esri/layers/layer|external:esri/layers/layer[])}
	 */
	exports.parseOperationalLayers = function (json) {
		var output, arr;

		// Create an array if only a single object was passed in.
		if (Array.isArray(json)) {
			arr = json;
		} else {
			arr = [json];
		}

		if (!json) {
			throw new TypeError("operationalLayer JSON not provided");
		}

		// Convert
		output = arr.map(operationalLayerToLayer);

		// If the input was a single object and not an array, extract
		// the single layer out of the output array.
		if (!Array.isArray(json)) {
			output = output[0];
		}

		return output;
	};

	return exports;
});