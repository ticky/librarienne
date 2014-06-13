(function() {

	Textual.fadeInLoadingScreen = function() {

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
		Textual.fadeInLoadingScreen();

	};

	console.log("Theme Script Loaded");

}());
