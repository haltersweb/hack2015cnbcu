(function ($) {
    // make sure the MYA.Overlays namespace is defined.
    CUI.Utils.define("MYA.Overlay");

    var $overlayBackground, // a reference to the dimmed background element.
        $currentOverlay, // a reference to the overlay that's currently being shown.
        $triggerElement = null, // a reference to the last focused element before the overlay was opened
        focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]',
        $mainContent // a reference to the main page
    ;

    function showOverlay ($overlay, options) {
        // you can only show the overlay if exactly one element is selected.
        if ($overlay.size() !== 1) {
            return this;
        }

        // set default values for the options.
        if (!options) {
            options = {};
        }
        options = $.extend({
            // Put defaults here
        }, options);

        // Identify the main form
        $mainContent = $('form').eq(0);

        // if the overlay background doesn't exist, create it.
        $overlayBackground = $('.mya-overlay-background');
        if ($overlayBackground.size() <= 0) {
            $overlayBackground = $('<div class="mya-overlay-background"></div>');
            $('body').prepend($overlayBackground);
        }
        // Show the background
        $overlayBackground.show();

        // Hide the main page from the screen reader
        $mainContent.attr('aria-hidden', 'true');

        // Position and show the overlay.
		var overlayHeight = $overlay.outerHeight();
        $overlay.css({
            "position": "fixed",
            "z-index": "200",
            "margin-left": -$overlay.outerWidth() / 2,
            "margin-top": -overlayHeight / 2,
            "left": "50%",
            "top": "50%"
        }).show();
        $overlay.attr('aria-hidden', 'false');

		// Use absolute positioning for overlay if it's too tall for viewport
		if($(window).height() < overlayHeight){
			$overlay.css({
				"position": "absolute",
				"top": $(document).scrollTop() + 10,
				"margin-top": "0"
			});
		}

        // Focusing the overlay means focus the first focusable element.
        // Should be the close box.
        focusOverlay($overlay);

        // Set the escape key to close the overlay.
        $overlay.on('keyup.mya-overlay', function (event) {
            escapeKeyClose(event);
        });

        // Capture focus events on bookends to contain tabbing
        // Note: We don't need to know the direction, because the only way to
        // tab to the first bookend is to shift tab (backwards), and
        // the only way to tab to the last bookend is to tab (forwards).
        var $bookends = $overlay.find('[data-role=tabbing-bookend]');
        // First check to make sure the bookends exist
        if ($bookends.size() > 0) {
            // Focusing first bookend sends focus to last real focusable element
            $bookends.eq(0).on('focus.mya-overlay', function (event) {
                var $focusableElements = $overlay.find(focusableSelector);
                $focusableElements.eq(-2).focus();
            });
            // Focusing last bookend sends focus to the first real focusable element
            $bookends.eq(1).on('focus.mya-overlay', function (event) {
                var $focusableElements = $overlay.find(focusableSelector);
                $focusableElements.eq(1).focus();
            });
        }

        // Containing the tabbing isn't enough,
        // because the user could click outside the dialog using the mouse.
        // So we attach a listener to every focusable element in the main form.
        $mainContent.on('focus.mya-overlay', focusableSelector, function (event) {
            event.preventDefault();
            focusOverlay($currentOverlay);
        });

        // keep a reference to this overlay.
        $currentOverlay = $overlay;

        // dim the background
        $('.overlay-background').show();
    }

    function hideOverlay ($overlay) {

        // hide the overlay and the dimmed background.
        $overlay.attr('aria-hidden', 'true');
        $overlay.hide();
        $overlayBackground.hide();

        // Disable escape key event
        $(document).off('keyup.mya-overlay');

        // Disable main content focus event
        $mainContent.off('focus.mya-overlay', focusableSelector);

        // Restore the main page to the screen reader
        $mainContent.attr('aria-hidden', 'false');

        // Return focus to the last focused element if there is one,
        // otherwise return focus to the document
        if ($triggerElement) {
            $triggerElement.focus();
        } else {
            $(document).focus();
        }

        // Lose the reference to the current overlay if that's the overlay we just hid.
        if ($currentOverlay && $overlay.get(0) === $currentOverlay.get(0)) {
            $currentOverlay = null;
        }

        return this;
    }

    // Close the overlay using the escape key
    function escapeKeyClose (event) {
        var key = event.which || event.keyCode;
        if (key === 27) {

            // If focus is in a form field, the escape key should not close the overlay
            // because form fields have default escape behavior on their own.
            if ($(':focus').filter('input, textarea').length > 0) {
                return;
            }

            // Close the current overlay
            if ($currentOverlay) {
                hideOverlay($currentOverlay);
            }
        }
    }

    // Focusing the overlay means focus the first focusable element.
    // Should be the close box.
    function focusOverlay ($overlay) {
        // Gather the overlay's focusable elements and focus the first one.
        var $focusableElements = $overlay.find(focusableSelector);
        $focusableElements.not('[type="hidden"]').eq(1).focus();
    }


    /**
     * Shows an overlay. The parameter is a jQuery object
     * or a selector string that can be used to identify
     * the overlay to be shown.
     */
    MYA.Overlay.show = function (element) {

        var $overlay = $(element);

        // Open the overlay if the element is an overlay in this namespace
        if ($overlay.hasClass('mya-overlay')) {
            showOverlay($overlay);
        }
    };

    /**
     * Hides an overlay. If a parameter is provided it's treated
     * as a selector string or jQuery object. If it's omitted,
     * the currently shown overlay is hidden.
     */
    MYA.Overlay.hide = function (element) {

        var $element,
            $overlay;

        if (typeof element === "string") {
            element = $(element);
        } else {
            $element = element;
        }

        if ($element) {
            $overlay = $element.closest(".mya-overlay");
        } else if ($currentOverlay) {
            $overlay = $currentOverlay;
        } else {
            return;
        }

        hideOverlay($overlay);
    };

    // when you click on an element with the "overlay-close" data attribute,
    // hide the overlay that contains the element you clicked on.
    $(document).on('click.mya-overlay', '.mya-overlay [data-role=mya-overlay-close]', function (event) {
        var $trigger= $(this),
            $overlay;

        $overlay = $trigger.closest('.mya-overlay');

        event.preventDefault();
        hideOverlay($overlay);
    });

    // NOTE: NOT BEING USED
    //       This event would call this showOverlay function, bypassing other My Account functionality.
    //       Instead, the MYA.Overlay.show public function will be called from existing My Account triggers.
    // Shows overlay on click of any element that has an overlay target defined in the data attribute.
    $(document).on('click.mya-overlay', '[data-mya-overlay-target]', function (event) {
        var $trigger = $(this),
            id = $trigger.attr('data-mya-overlay-target'),
            $overlay = $('#' + id);

        event.preventDefault();

        // Store the element that triggered the overlay so we can focus it again
        $triggerElement = $trigger;

        showOverlay($overlay);
    });

} (jQuery));