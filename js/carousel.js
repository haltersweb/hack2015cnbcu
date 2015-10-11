/**
 * Accessibility Helpers
 */
/*
requires cui-accessibility-helpers.js
*/
(function ($) {
    'use strict';
	/*
	carousel stuff
	*/
	CUI.carousel = {};
	function animateCarousel(carousel) {
		var carouselItem = parseInt(carousel.$carouselItemsContainer.attr('data-carousel-item-shown'));
    	if (carouselItem === carousel.totalItems) {
    		carouselItem = 1;
    	} else {
    		carouselItem += 1;
    	}
    	changeCarouselFrame(carouselItem, carousel);
	};
	function startCarouselAnimation(carousel) {
		CUI.carousel.carouselAnimation = setInterval(function () {
	    	animateCarousel(carousel);
	    }, 3000);
	};
	function stopCarouselAnimation() {
		clearInterval(CUI.carousel.carouselAnimation);
	};
	function changeCarouselFrame(carouselItem, carousel) {
		var $currentCarouselItem,
			$newCarouselItem;
    	$currentCarouselItem = carousel.$carouselItemsContainer.children().not('[aria-hidden="true"]');
    	$newCarouselItem = carousel.$carouselItemsContainer.find('[data-carousel-item="' + carouselItem + '"]');
    	lentilChangeState(carousel.$lentils.filter('[data-carousel-item="' + carouselItem + '"]'));
    	NAME.access.ariaHideContent($currentCarouselItem);
    	NAME.access.ariaShowContent($newCarouselItem);
    	carousel.$carouselItemsContainer.attr('data-carousel-item-shown', carouselItem);
	}
	function arrowChangeState(carousel) {
		carousel.$arrow.toggleClass('disabled');
	}
	function lentilChangeState($lentil) {
		$lentil.addClass('enabled')
			.siblings('.enabled').removeClass('enabled');
	}
	function lentilEvents(carousel) {
	    carousel.$lentils.click(function (evt) {
	    	var $this = $(this),
	    		frameNumber = $this.attr('data-carousel-item');
			stopCarouselAnimation();
	    	changeCarouselFrame(frameNumber, carousel);
			window.setTimeout(function() {
				carousel.$carouselItemsContainer.children('[data-carousel-item="' + frameNumber + '"]').focus();
			}, 1000);
		});
	}
	function arrowEvents(carousel) {
		carousel.$arrows.click(function (evt) {
			var currentFrame,
				targetFrame;
			stopCarouselAnimation();
			currentFrame = parseInt(carousel.$carouselItemsContainer.attr('data-carousel-item-shown'));
			if ($(this).is('[class*="left"]')) {
			//if left arrow
				targetFrame = (currentFrame === 1) ? 1 : (currentFrame - 1);
			} else {
			//else right arrow
				targetFrame = (currentFrame === carousel.totalItems) ? carousel.totalItems : (currentFrame + 1);
			}
			changeCarouselFrame(targetFrame, carousel);
			window.setTimeout(function() {
				carousel.$carouselItemsContainer.children('[data-carousel-item="' + targetFrame + '"]').focus();
			}, 1000);
		});
	}
	function keypressEvents(carousel) {
		carousel.$carousel.on('keydown', function (evt) {
			if (evt.keyCode === CUI.keyboard.left) {
				carousel.$arrows.filter('[class*="left"]').trigger('click');
				return;
			}
			if (evt.keyCode === CUI.keyboard.right) {
				carousel.$arrows.filter('[class*="right"]').trigger('click');
				return;
			}
		});
	};
	function init() {
		//NEED TO MAKE A CAROUSEL CONSTRUCTOR
		var carousel = {};
			carousel.$carousel = $('.carousel');
	    	carousel.$carouselItemsContainer = carousel.$carousel.find('.carousel-items');
	    	carousel.totalItems = carousel.$carouselItemsContainer.children().length;
	    	carousel.$arrows = carousel.$carousel.find('[class^="carousel-btn"]');
			carousel.$lentils = carousel.$carousel.find('.lentil');
		carousel.$carouselItemsContainer.focusin(function () {
			stopCarouselAnimation();
		});
		lentilEvents(carousel);
		arrowEvents(carousel);
		keypressEvents(carousel);
		NAME.access.ariaHideContent($('.carousel-item').not('[data-carousel-item="1"]'));
		startCarouselAnimation(carousel);
	}
	$(document).ready(function () {
		init();
	});
}(jQuery));




