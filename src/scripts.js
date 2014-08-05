(function() {

	var punctuationCharacters = [
		',',
		':',
		'.',
		'!',
		'?'
	];

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

	};

	console.log("Theme Script Loaded");

}());
