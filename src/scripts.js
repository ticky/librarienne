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
	];
	var fetchedUrls = [];
	var checkShowRepeatedNicknames;
	var checkShowChannelIntro;
	var checkShowOpenGraphPreviews;
	var buttonClosePreferences;

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

		} else if (key === 'Show Open Graph Previews') {

			checkShowOpenGraphPreviews.checked = app.styleSettingsRetrieveValue('Show Open Graph Previews');

			document.body.classList[checkShowOpenGraphPreviews.checked === true ? 'add' : 'remove']('show-open-graph-previews');

		}
	};

	Textual.viewBodyDidLoad = function() {
		console.debug('View Finished Loading');

		// style settings supported; enable user style preferences
		if (app.styleSettingsRetrieveValue instanceof Function) {

			var buttonShowPreferences = document.createElement('button');
				buttonShowPreferences.id = 'show_preferences';
				buttonShowPreferences.appendChild(document.createTextNode('⌘'));

			var divPreferences = document.createElement('div');
				divPreferences.id = 'preferences';

			var divPreferenceBox = document.createElement('div');
				divPreferenceBox.className = 'box';
				divPreferences.appendChild(divPreferenceBox);

			var divCheckboxes = document.createElement('div');
				divCheckboxes.className = 'checkboxes';
				divPreferenceBox.appendChild(divCheckboxes);

			buttonClosePreferences = document.createElement('button');
				buttonClosePreferences.id = 'buttonClosePreferences';
				buttonClosePreferences.innerHTML = 'Close';
				divPreferenceBox.appendChild(buttonClosePreferences);

			var labelShowRepeatedNicknames = document.createElement('label');

			checkShowRepeatedNicknames = document.createElement('input');
				checkShowRepeatedNicknames.id = 'checkShowRepeatedNicknames';
				checkShowRepeatedNicknames.type = 'checkbox';
				labelShowRepeatedNicknames.appendChild(checkShowRepeatedNicknames);
				labelShowRepeatedNicknames.appendChild(document.createTextNode(' Show nicknames for repeated messages from the same sender'));
				divCheckboxes.appendChild(labelShowRepeatedNicknames);

			var labelShowOpenGraphPreviews = document.createElement('label');

			checkShowOpenGraphPreviews = document.createElement('input');
				checkShowOpenGraphPreviews.id = 'checkShowOpenGraphPreviews';
				checkShowOpenGraphPreviews.type = 'checkbox';
				labelShowOpenGraphPreviews.appendChild(checkShowOpenGraphPreviews);
				labelShowOpenGraphPreviews.appendChild(document.createTextNode(' Enable inline Open Graph previews'));
				divCheckboxes.appendChild(labelShowOpenGraphPreviews);

			document.body.appendChild(buttonShowPreferences);
			document.body.appendChild(divPreferences);

			checkShowRepeatedNicknames.addEventListener('click', function() {
				app.styleSettingsSetValue('Show Repeated Nicknames', checkShowRepeatedNicknames.checked);
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

			Textual.styleSettingDidChange('Show Open Graph Previews');

		}

		Textual.scrollToBottomOfView();
		Textual.fadeOutLoadingScreen();
	};

	Textual.newMessagePostedToView = function(lineNumber) {
		var lineId = 'line-' + lineNumber;

		var line = document.getElementById(lineId);

		var message = line.querySelector('.message');

		var innerMessage = message.querySelector('.innerMessage');

		var sender = line.querySelector('.sender');
		var senderText = sender !== null && sender.getAttribute('nickname');

		var querySelectorAllAsArray = buildQuerySelectorAllAsArrayFunction(message);

		if (line.classList.contains('action') && punctuationCharacters.indexOf(innerMessage.textContent.trim()[0]) !== -1) {
			line.classList.add('punctuated');
		}

		var previousMessage = line.previousElementSibling;
		var previousMessageSender = null;

		if (previousMessage !== null && previousMessage.id === 'mark') {
			previousMessage = previousMessage.previousElementSibling;
		}

		if (previousMessage !== null && senderText !== null) {
			previousMessageSender = previousMessage.querySelector('.sender');

			if (previousMessageSender !== null && senderText === previousMessageSender.getAttribute('nickname')) {
				line.classList.add('repeated-nickname');
			}
		}

		if (typeof checkShowOpenGraphPreviews !== 'undefined' && checkShowOpenGraphPreviews.checked === true && line.classList.contains('text')) {

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

					innerMessage.appendChild(displayElement);

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
								displayElement.style.backgroundImage = 'linear-gradient(to right, rgba(241,241,241,.8) 0%, rgba(241,241,241,.95) 100%), url(' + parsedData.image + ')';
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
							innerMessage.removeChild(displayElement);
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
