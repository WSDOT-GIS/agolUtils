/*global define, module*/

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.AttachmentInfoCollection = factory();
	}
}(this, function () {

	/**
	 * Information returned from the {@link http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Attachment_Infos_Map_Service_Layer/02r3000000r0000000/|Attachment Infos REST Endpoint}
	 * @typedef {Object} ArcGisRestAttachmentInfo
	 * @property {number} id - Unique identifier for attachment in relation to the layer.
	 * @property {string} contentType - MIME type of attachment.
	 * @property {number} size - Size of the attachment.
	 * @property {string} name - Attachment's original file name.
	 */

	/**
	 * Represents information returned from the {@link http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Attachment_Infos_Map_Service_Layer/02r3000000r0000000/|Attachment Infos REST Endpoint}
	 * @param {ArcGisRestAttachmentInfo} attachmentInfo
	 * @param {string} attachmentsUrl
	 * @member {number} id - Unique identifier for attachment in relation to the layer.
	 * @member {string} contentType - MIME type of attachment.
	 * @member {number} size - Size of the attachment.
	 * @member {string} name - Attachment's original file name.
	 * @constructor
	 */
	function AttachmentInfo(attachmentInfo, attachmentsUrl) {
		this.id = attachmentInfo.id;
		this.contentType = attachmentInfo.contentType;
		this.size = attachmentInfo.size;
		this.name = attachmentInfo.name;
		this.attachmentsUrl = attachmentsUrl;
	}

	AttachmentInfo.prototype.toAnchor = function () {
		var a = document.createElement("a");

		a.href = [this.attachmentsUrl, this.id].join("/");
		//a.textContent = this.name;
		a.title = this.name;

		return a;
	};

	AttachmentInfo.prototype.toLI = function () {
		var li = document.createElement("li");

		var a = this.toAnchor();

		li.appendChild(a);

		return li;
	};

	/**
	 * 
	 * @param {string} attachmentsUrl
	 * @param {(AttachmentInfo[]|Object.<string, AttachmentInfo[]>)} attachmentInfos
	 * @param {string} galleryPageUrl
	 */
	function AttachmentInfoCollection(attachmentsUrl, attachmentInfos, galleryPageUrl) {

		if (attachmentInfos.attachmentInfos) {
			attachmentInfos = attachmentInfos.attachmentInfos;
		}

		attachmentInfos = attachmentInfos.map(function (info) {
			if (!(info instanceof AttachmentInfo)) {
				info = new AttachmentInfo(info, attachmentsUrl);
			}
			return info;
		});

		this.attachmentsUrl = attachmentsUrl;
		this.attachmentInfos = attachmentInfos || null;
		this.galleryPageUrl = galleryPageUrl || null;
	}


	AttachmentInfoCollection.prototype.toQueryString = function () {
		var params = {
			url: this.attachmentsUrl,
			infos: JSON.stringify(this.attachmentInfos)
		};

		var qs = [];
		for (var name in params) {
			if (params.hasOwnProperty(name)) {
				qs.push([name, encodeURIComponent(params[name])].join("="));
			}
		}
		qs = qs.join("&");
		return qs;
	};

	/**
	 * 
	 * @param {string} [qs=window.location.search]
	 * @return {AttachmentInfoCollection}
	 */
	AttachmentInfoCollection.parseFromQueryString = function (qs) {
		// Get the query string from the window if omitted.
		if (!qs && window && window.location && window.location.search) {
			qs = window.location.search;
		}
		// Remove leading question mark from query string.
		qs = qs.replace(/^\?/, "");
		// Split into array of key=value strings.
		var qsParts = qs.split("&");
		// Convert the key=value string array into an object.
		var o = {};
		qsParts.forEach(function (s) {
			s = s.split("=");
			s[1] = decodeURIComponent(s[1]);
			if (s[0] === "infos") {
				o.infos = JSON.parse(s[1]);
			} else {
				o[s[0]] = s[1];
			}
		});
		return new AttachmentInfoCollection(o.url, o.infos, window.location ? window.location.toString() : null);
	};

	/**
	 * Converts to a URL with a query string.
	 * @param {string} galleryPageUrl
	 * @returns {string}
	 */
	AttachmentInfoCollection.prototype.toGalleryLinkUrl = function () {
		var qs = this.toQueryString();
		var url = [this.galleryPageUrl || "", qs].join("?");
		return url;
	};

	/**
	 * 
	 * @returns {HTMLUListElement}
	 */
	AttachmentInfoCollection.prototype.toUl = function () {
		var ul = document.createElement("ul");
		this.attachmentInfos.forEach(function (ai) {
			var li = ai.toLI();
			ul.appendChild(li);
		});
		return ul;
	};


	/**
	 * 
	 * @returns {HTMLDocumentFragment}
	 */
	AttachmentInfoCollection.prototype.toBlueimpGalleryLinks = function () {
		var frag = document.createDocumentFragment();

		this.attachmentInfos.forEach(function (ai) {
			var li = ai.toAnchor();
			frag.appendChild(li);
		});




		return frag;
	};

	return AttachmentInfoCollection;
}));