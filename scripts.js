(function() {

	/* === Textual Event Shim ===
	 * Mock out Textual callbacks to be DOM events
	 * This provides a slightly nicer API to work with */

    function createEventEmitter(type) {

        return function EventEmitter() {

            var target = document.body,
                event = new CustomEvent(type, {
                    detail: Array.prototype.slice.call(arguments)
                });

            if (type === 'newMessagePostedToView' || type === 'viewPositionMovedToLine') {
                var newTarget = document.getElementById('line-' + arguments[0]);
                if (newTarget) {
                    target = newTarget;
                }
            }

            target.dispatchEvent(event);

        }

    }

    [
    	'viewInitiated',
	    'newMessagePostedToView',
	    'historyIndicatorAddedToView',
	    'historyIndicatorRemovedFromView',
	    'topicBarValueChanged',
	    'viewContentsBeingCleared',
	    'viewFinishedLoading',
	    'viewFinishedReload',
	    'viewFontSizeChanged',
	    'viewPositionMovedToBottom',
	    'viewPositionMovedToHistoryIndicator',
	    'viewPositionMovedToLine',
	    'viewPositionMovedToTop',
	    'sidebarInversionPreferenceChanged',
	    'handleEvent'
    ].forEach(function(event) {

        Object.defineProperty(Textual, event, {
            enumerable: true,
            value: createEventEmitter(event)
        });

    });

	Textual.fadeInLoadingScreen = function() {

		// Override loading screen fade
		var loadingScreen = document.getElementById("loading_screen");
		loadingScreen.style.opacity = 0;

		setTimeout(function() {
			loadingScreen.style.display = "none";
		}, 250);

	};

	document.addEventListener('DOMContentLoaded', function() {

		console.log("Theme Script Loaded");

		function onReady() {

			console.debug("View Finished Loading");

			Textual.scrollToBottomOfView();
			Textual.fadeInLoadingScreen();

		}

		document.body.addEventListener('viewInitiated', function(e) { console.log("view initiated", e); });

		document.body.addEventListener('viewFinishedLoading', onReady);
		document.body.addEventListener('viewFinishedReload', onReady);

	});

}());