(function() {

	'use strict';

	/* global app */
	/* global console */
	/* global Textual */

	var punctuationCharacters = ',:.!?'.split('');

	Textual.fadeOutLoadingScreen = function() {
		// Override loading screen fade
		var loadingScreen = document.getElementById('loading_screen');
		loadingScreen.style.opacity = 0;

		setTimeout(function() {
			loadingScreen.style.display = 'none';
		}, 250);
	};

	Textual.viewBodyDidLoad = function() {
		console.debug('View Finished Loading');

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
	};

	console.log('Theme Script Loaded');

}());
