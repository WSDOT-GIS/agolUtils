/*global AttachmentInfoCollection, blueimp */

(function () {
	if (window.location.search) {
		var aic = AttachmentInfoCollection.parseFromQueryString(window.location.search);
		console.log(aic);

		var linksDiv = document.getElementById("links");
		linksDiv.appendChild(aic.toBlueimpGalleryLinks());

		blueimp.Gallery(
			document.getElementById('links').getElementsByTagName('a'),
			{
				container: '#blueimp-gallery-carousel',
				carousel: true
			}
		);
	}
}());