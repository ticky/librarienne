(function() {

	'use strict';

	/* global app */
	/* global console */
	/* global Textual */

	var punctuationCharacters = [
			',',
			':',
			'.',
			'!',
			'?'
		],
		fetchedUrls = [],
		checkShowRepeatedNicknames,
		checkShowChannelIntro,
		checkShowOpenGraphPreviews,
		buttonClosePreferences;

	function buildQuerySelectorAllAsArrayFunction(node) {

		return function() {

			return Array.prototype.concat.apply([], Array.prototype.map.call(arguments, function(query) {
				return Array.prototype.slice.call(node.querySelectorAll(query));
			}));

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

	}

	function metaParser(doc) {

		var querySelectorAllAsArray = buildQuerySelectorAllAsArrayFunction(doc);

		var titles = querySelectorAllAsArray(
				'meta[property=\'og:title\']:not([content=\'\'])'
			);
			titles.push(doc.title);
		
		var descriptions = querySelectorAllAsArray(
				'meta[property=\'og:description\']:not([content=\'\'])',
				'meta[name=\'description\']:not([content=\'\'])'
			);
		
		var siteNames = querySelectorAllAsArray(
				'meta[property=\'og:site_name\']:not([content=\'\'])'
			);
		
		var types = querySelectorAllAsArray(
				'meta[property=\'og:type\']:not([content=\'\'])'
			);
			types.push('website');
		
		var images = querySelectorAllAsArray(
				'meta[property=\'og:image\']:not([content=\'\'])',
				'meta[property=\'og:image:url\']:not([content=\'\'])'
			);
		
		var urls = querySelectorAllAsArray(
				'link[rel=\'canonical\']',
				'meta[property=\'og:url\']:not([content=\'\'])'
			);

		return {
			title: normaliseMeta(titles.shift()),
			description: normaliseMeta(descriptions.shift()),
			siteName: normaliseMeta(siteNames.shift()),
			type: normaliseMeta(types.shift()),
			image: normaliseMeta(images.shift()),
			url: normaliseMeta(urls.shift())
		};

	}

	Textual.fadeOutLoadingScreen = function() {

		// Override loading screen fade
		var loadingScreen = document.getElementById('loading_screen');
		loadingScreen.style.opacity = 0;

		setTimeout(function() {
			loadingScreen.style.display = 'none';
		}, 250);

	};

	Textual.styleSettingDidChange = function(key) {

		console.debug('Style setting "' + key + '\" changed to', app.styleSettingsRetrieveValue(key));

		if (key === 'Show Repeated Nicknames') {

			checkShowRepeatedNicknames.checked = app.styleSettingsRetrieveValue('Show Repeated Nicknames');

			document.body.classList[checkShowRepeatedNicknames.checked === true ? 'add' : 'remove']('show-repeated-nicknames');

		} else if (key === 'Hide Channel Intro') {

			checkShowChannelIntro.checked = !app.styleSettingsRetrieveValue('Hide Channel Intro');

			document.body.classList[checkShowChannelIntro.checked === true ? 'remove' : 'add']('hide-channel-intro');

		} else if (key === 'Show Open Graph Previews') {

			checkShowOpenGraphPreviews.checked = app.styleSettingsRetrieveValue('Show Open Graph Previews');

			document.body.classList[checkShowOpenGraphPreviews.checked === true ? 'add' : 'remove']('show-open-graph-previews');

		}

	};

	Textual.viewFinishedLoading = Textual.viewFinishedReload = function() {

		console.debug('View Finished Loading');

		console.debug(app.styleSettingsRetrieveValue instanceof Function);

		// style settings supported; enable user style preferences
		if (app.styleSettingsRetrieveValue instanceof Function) {

			var buttonShowPreferences = document.createElement('button');
				buttonShowPreferences.id = 'show_preferences';
				buttonShowPreferences.appendChild(document.createTextNode('⌘'));

			document.body.appendChild(buttonShowPreferences);

			checkShowRepeatedNicknames = document.getElementById('checkShowRepeatedNicknames');

			checkShowChannelIntro = document.getElementById('checkShowChannelIntro');

			checkShowOpenGraphPreviews = document.getElementById('checkShowOpenGraphPreviews');

			buttonClosePreferences = document.getElementById('buttonClosePreferences');

			checkShowRepeatedNicknames.addEventListener('click', function() {
				app.styleSettingsSetValue('Show Repeated Nicknames', checkShowRepeatedNicknames.checked);
			});

			checkShowChannelIntro.addEventListener('click', function() {
				app.styleSettingsSetValue('Hide Channel Intro', !checkShowChannelIntro.checked);
			});

			checkShowOpenGraphPreviews.addEventListener('click', function() {
				app.styleSettingsSetValue('Show Open Graph Previews', checkShowOpenGraphPreviews.checked);
			});

			buttonShowPreferences.addEventListener('click', function() {
				document.body.classList.add('show-preferences');
			});

			buttonClosePreferences.addEventListener('click', function() {
				document.body.classList.remove('show-preferences');
			});

			Textual.styleSettingDidChange('Show Repeated Nicknames');

			Textual.styleSettingDidChange('Hide Channel Intro');

			Textual.styleSettingDidChange('Show Open Graph Previews');

		}

		Textual.scrollToBottomOfView();
		Textual.fadeOutLoadingScreen();

	};

	Textual.newMessagePostedToView = function(lineNumber) {

		var lineId = 'line-' + lineNumber;

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

		if (previousMessage !== null && line.hasAttribute('nickname') && line.getAttribute('nickname') === previousMessage.getAttribute('nickname')) {
			line.classList.add('repeated-nickname');
		}

		if (checkShowOpenGraphPreviews.checked === true && line.classList.contains('text')) {

			var previewedImageUrls = querySelectorAllAsArray('a.inline_image:link').map(function(link) {
				return link.href;
			});

			var ogpCandidates = querySelectorAllAsArray('a:link:not(.inline_image)').filter(function(link) {
				return previewedImageUrls.indexOf(link.href) === -1;
			}).map(function(link) {
				return link.href;
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

							var parsedData = metaParser(request.response),
								parsedUrl = parsedData.url || url,
								parsedDomain = parsedUrl.split('//').pop().split('/').shift();

							if (typeof parsedData.image !== 'undefined') {
								var imageWrapper = document.createElement('div');
									imageWrapper.classList.add('image_wrapper');
								var image = document.createElement('img');
									image.src = parsedData.image;
								imageWrapper.appendChild(image);
								displayElement.appendChild(imageWrapper);
							}

							var details = document.createElement('div');
								details.classList.add('details');

							var title = document.createElement('h3'),
								titleLink = document.createElement('a');
								titleLink.href = parsedUrl;
								titleLink.appendChild(document.createTextNode(parsedData.title));
								
							title.appendChild(titleLink);
							
							details.appendChild(title);

							var siteName = document.createElement('strong');
								siteName.appendChild(document.createTextNode(parsedData.siteName || parsedDomain));
							details.appendChild(siteName);

							if (typeof parsedData.description !== 'undefined') {
								var description = document.createElement('p');

								parsedData.description.split('\n').forEach(function(descriptionLine, descriptionLineIndex, descriptionArray) {
									description.appendChild(document.createTextNode(descriptionLine));
									if (descriptionLineIndex + 1 < descriptionArray.length) {
										description.appendChild(document.createElement('br'));
									}
								});

								details.appendChild(description);
							}

							displayElement.appendChild(details);

							displayElement.style.display = '';

						};
						request.onerror = request.ontimeout = function() {
							message.removeChild(displayElement);
						};
						request.send();

				}

			});

			if (ogpCandidates.length < 1) {
				console.debug('No OGP candidates found...');
			}

		}

	};

	console.log('Theme Script Loaded');

}());
