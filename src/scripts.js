(function() {

	var punctuationCharacters = [
			',',
			':',
			'.',
			'!',
			'?'
		],
		fetchedUrls = [],
		serverId,
		channelId;

	function buildQuerySelectorAllAsArrayFunction(node) {

		return function(query) {

			return Array.prototype.slice.call(node.querySelectorAll(query));

		};

	}

	function normaliseMeta(meta) {

		if (typeof meta === 'object' && typeof meta.nodeName !== 'undefined') {
			// DOM element
			if (meta.nodeName === 'META' && (meta.hasAttribute('property') || meta.hasAttribute('name'))) {
				// OG or generic META Element
				return meta.getAttribute('content');
			}
			if (meta.nodeName === 'LINK' && meta.hasAttribute('href')) {
				// Link Element
				return meta.getAttribute('href');
			}
		}
		if (typeof meta === 'string') {
			return meta;
		}
		return '';

	}

	function metaParser(doc) {

		var querySelectorAllAsArray = buildQuerySelectorAllAsArrayFunction(doc);

		var titles = querySelectorAllAsArray(
				"meta[property='og:title']:not([content=''])"
			);
			titles.push(doc.title);
		
		var descriptions = querySelectorAllAsArray([
				"meta[name='description']:not([content=''])",
				"meta[property='og:description']:not([content=''])"
			].join(', '));
		
		var siteNames = querySelectorAllAsArray(
				"meta[property='og:site_name']:not([content=''])"
			);
		
		var types = querySelectorAllAsArray(
				"meta[property='og:type']:not([content=''])"
			);
			types.push('website');
		
		var images = querySelectorAllAsArray([
				"meta[property='og:image']:not([content=''])",
				"meta[property='og:image:url']:not([content=''])"
			].join(', '));
		
		var urls = querySelectorAllAsArray([
				"link[rel='canonical']",
				"meta[property='og:url']:not([content=''])"
			].join(', '));

		return {
			title: normaliseMeta(titles.shift()),
			description: normaliseMeta(descriptions.shift()),
			siteName: normaliseMeta(siteNames.shift()),
			type: normaliseMeta(types.shift()),
			image: normaliseMeta(images.shift()),
			url: normaliseMeta(urls.shift())
		};

	}

	Textual.viewInitiated = function(type, server, channel, channelName) {
		serverId = server;
		channelId = channel;
	};

	Textual.fadeOutLoadingScreen = function() {

		// Override loading screen fade
		var loadingScreen = document.getElementById("loading_screen");
		loadingScreen.style.opacity = 0;

		setTimeout(function() {
			loadingScreen.style.display = "none";
		}, 250);

	};

	Textual.viewFinishedLoading = Textual.viewFinishedReload = function() {

		console.debug("View Finished Loading");

		Textual.scrollToBottomOfView();
		Textual.fadeOutLoadingScreen();

	};

	Textual.newMessagePostedToView = function(lineNumber) {

		var lineId = "line-" + lineNumber;

		var line = document.getElementById(lineId);

		var message = line.querySelector('.message');

		var querySelectorAllAsArray = buildQuerySelectorAllAsArrayFunction(message);

		if (line.classList.contains('action') && punctuationCharacters.indexOf(message.textContent[0]) !== -1) {
			line.classList.add('punctuated');
		}

		var previousMessage = line.previousElementSibling;

		if (previousMessage !== null && previousMessage.id === 'mark') {
			previousMessage = previousMessage.previousElementSibling;
		}

		if (previousMessage !== null && line.getAttribute('nickname') === previousMessage.getAttribute('nickname')) {
			line.classList.add('repeated-nickname');
		}

		if (app.styleSettingsRetrieveValue instanceof Function
			&& app.styleSettingsRetrieveValue('Retrieve Link Metadata') === true
			&& app.styleSettingsRetrieveValue('Retrieve Link Metadata for ' + serverId + ', ' + channelId) !== false) {

			var previewedImageUrls = querySelectorAllAsArray('a.inline_image:link').map(function(link) {
				return link.href;
			});

			var ogpCandidates = querySelectorAllAsArray('a:link:not(.inline_image)').filter(function(link) {
				return previewedImageUrls.indexOf(link.href) === -1;
			});

			ogpCandidates.forEach(function(url) {

				if (fetchedUrls.indexOf(url) === -1) {

					fetchedUrls.push(url);

					var displayElement = document.createElement('div');
						displayElement.classList.add('inline_opengraph');
						displayElement.style.display = 'none';

					message.appendChild(displayElement);

					var request = new XMLHttpRequest();
						request.open('GET', url, true);
						request.responseType = 'document';
						request.timeout = 15000;
						request.onload = function() {

							var parsedData = metaParser(request.response);

							if (parsedData.image !== '') {
								var image = document.createElement('img');
									image.src = parsedData.image;
								displayElement.appendChild(image);
							}

							var details = document.createElement('div');
								details.classList.add('details');

							var title = document.createElement('h3'),
								titleLink = document.createElement('a');
								titleLink.href = parsedData.url;
								titleLink.appendChild(document.createTextNode(parsedData.title));
								
							title.appendChild(titleLink);
							
							details.appendChild(title);

							if (parsedData.description !== '') {
								var description = document.createElement('p');
									description.appendChild(document.createTextNode(parsedData.description));
								details.appendChild(description);
							}

							displayElement.appendChild(details);

							displayElement.style.display = '';

						};
						request.onerror = request.ontimeout = function() {
							message.removeChild(displayElement);
						};
						request.send();

				};

			});

			if (ogpCandidates.length < 1) {
				console.debug("No OGP candidates found...");
			}

		}

	};

	console.log("Theme Script Loaded");

}());
