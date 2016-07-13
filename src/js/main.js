
if ($.browser.mobile) $('body').addClass('mobile');
if ($.browser.safari) $('body').addClass('safari');

var getleaf = {};

var loading = {
	avgTime: 3000,
	trg: 1,
	state: 0,
	preloader: $('body > .preloader'),
	loaded: function () {

		if(++loading.state == loading.trg) {

			loading.status(1);
			setTimeout(loading.done, 500);

		} else {

			loading.status(loading.state / loading.trg / 1.1);

		}
	},
	status: function (mult) {

		loading.preloader.find('> .after').css({
			'width': mult * 100 + '%'
		});

	},
	done: function () {

		if (loading.finished) return;

		// TODO temp for developing
		// $('section.articles-gallery-1 > article, .article-content, .article-name, .article-date, .video, .article-page, #about-modal .content-holder').find('p, h1, h2, h3, h4, h5, h6, blockquote, span').attr('contenteditable', true).on('click', function (e) {
		// 	e.preventDefault();
		// });
		// $('.article-holder-1 a').on('click', function (e) {
		// 	e.preventDefault();
		// });

		setTimeout(function () {

			// WOW init
			if ($.browser.desktop) {

				new WOW().init();

			}

		}, 380);

		// hide preloader
		loading.preloader.addClass('done').animate({}).delay(400).animate({
			'opacity': 0
		}, 400, function () {

			bodyOverflow.unfixBody();

			$(window)
				.trigger('scroll')
				.trigger('resize');

			loading.status(0);
			$(this).detach();
			loading.finished = true;

		});

	}
};

// TODO test it
$('img').each(function () {

	if (!this.naturalWidth || true) {
		loading.trg ++;
		$(this).one('load', loading.loaded);
	}

});

$(document).on('ready', function () {
	var $window = $(window),
		winWidth = $window.width(),
		winHeight = $window.height(),
		bodyHeight = $('body').height(),
		goUp = (function () {

			var $el = $('#to-top'),
				state = false,
				speed = 900,
				paused = false,
				plg = {
					up: function () {

						paused = true;
						state = true;

						$("html, body").stop().animate({scrollTop:0}, speed, 'swing', function () {

							paused = false;

						}).one('touchstart mousewheel DOMMouseScroll wheel', function () {

							$(this).stop(false, false).off('touchstart mousewheel DOMMouseScroll wheel');
							paused = false;

						});

						plg.hide();

					},
					show: function () {

						if (!state && !paused) {

							$el.addClass('opened');

							state = true;

						}

					},
					hide: function () {

						if (state) {

							$el.removeClass('opened');

							state = false;

						}

					},
					$el: $el
				};

			$el.on('click', function () {

				plg.up();

			});

			return plg;

		})();

		// Initializing plugins

		// modals
		var modals = (function () {

			var plg;
			$('[data-modal]').on('click', function (e) {
				e.preventDefault();


				var $self = $(this),
					target = $self.attr('data-modal'),
					$target = $(target);

				if ( $self.hasClass('active') ) return;

				if ($target.length) {
					modals.openModal($target);
				} else {
					console.warn('Ошибка в элементе:');
					console.log(this);
					console.warn('Не найдены элементы с селектором ' + target);
				}

			});

			$('[data-close]').on('click', function (e) {

				e.preventDefault();

				var $self = $(this),
					target = $self.attr('data-close'),
					$target;

				if (target) {

					$target = $(target);

					if ($target.length) {

						modals.closeModal( $target );

					}

				} else {

					modals.closeModal( $self.closest('.opened') );

				}

			});

			$('.modal-holder').not('.fake').on('click', function (e) {

				if (e.target === this) {

					modals.closeModal( $(this) );

				}

			});

			$window.on('keyup', function (e) {

				// esc pressed
				if (e.keyCode == '27') {

					modals.closeModal();

				}

			});
			plg = {
				opened: [],
				openModal: function ( $modal ) {

					if (!$modal.data('modal-ununique') && this.opened.length > 0) {
						modals.closeModal( this.opened[this.opened.length - 1], true );
					}
					this.opened.push( $modal );
					// $modal.addClass('opened').one( transitionPrefix, bodyOverflow.fixBody );

					$modal.off( transitionPrefix ).addClass('opened');
					bodyOverflow.fixBody();

					if ( $modal.is('[data-cross]') ) {

						this.$cross = $('<div>').addClass('cross-top-fixed animated ' + $modal.attr('data-cross') ).one('click', function () {

							modals.closeModal();

						}).one(animationPrefix, function () {

							$(this).removeClass( 'animated' );

						}).appendTo('body');

					}

				},
				closeModal: function ($modal, alt) {

					if ( this.opened.length > 0 && !$modal ) {

						for ( var y = 0; y < this.opened.length; y++ ) {

							this.closeModal( this.opened[y] );

						}

						return;

					} else if ( $modal && !($modal instanceof jQuery) ) {

						$modal = $( $modal );

					} else if ( $modal === undefined ) {

						throw 'something went wrong';

					}

					try {

						$modal.removeClass('opened');

					} catch (e) {

						console.error(e);

						this.closeModal();

						return;

					}

					this.opened.pop();

					if (!alt) {

						$modal.one( transitionPrefix, bodyOverflow.unfixBody );

						try {

							this.$cross.addClass('fadeOut').one(animationPrefix, function () {

								$(this).remove();

							});

						} catch (e) {

							console.error(e);

						}

					} else {

						this.$cross.remove();

					}

				}

			};

			return plg;
		})();

		// tooltips
		var tooltips = (function () {

			var plg = {
				opened: [],
				$body: $('body'),
				bodyHandler: function (e) {
					var $self = $(e.target),
						hasOpenedParent = null;
					if ( $self.hasClass('opened') ) {
						hasOpenedParent = true;
					} else {
						for (var i = 0; i < $self.parents().length; i++) {
							if ( $self.parents().eq(i).hasClass('opened') ) {
								hasOpenedParent = true;
								break;
							}
						}
					}

					if ( hasOpenedParent !== true ) {
						e.preventDefault();
						e.stopPropagation();
						tooltips.closeTooltip();
					}

				},
				openTooltip: function ( $modal, $self ) {

					if ( this.opened.length > 0 ) {
						tooltips.closeTooltip();
					}
					this.opened.push( $modal );
					this.opened.push( $self );

					this.$body.addClass('tooltip').on('click', this.bodyHandler);

					$modal.off( transitionPrefix ).addClass('opened');
					$self.addClass('opened');

				},
				closeTooltip: function () {

					this.$body.removeClass('tooltip').off('click', this.bodyHandler);

					for ( var y = 0; y < this.opened.length; y++ ) {

						this.opened[y].removeClass('opened');

					}

					this.opened = [];

				}

			};

			$('[data-tooltip]').on('click', function (e) {

				e.preventDefault();

				var $self = $(this),
					target = $self.attr('data-tooltip'),
					$target = $(target);

				if ($target.length) {

					tooltips.openTooltip($target, $self);

				} else {

					console.warn('Ошибка в элементе:');
					console.log(this);
					console.warn('Не найдены элементы с селектором ' + target);

				}
				
			});

			$window.on('keyup', function (e) {

				// esc pressed
				if (e.keyCode == '27') {

					tooltips.closeTooltip();

				}

			});

			return plg;
		})();


		// shuffle array
		Array.prototype.shuffle = function() {

			for (var i = this.length - 1; i > 0; i--) {

				var num = Math.floor(Math.random() * (i + 1)),
					d = this[num];
				this[num] = this[i];
				this[i] = d;

			}

			return this;

		};

		// videos holder
		(function () {

			// TODO refactor it

			var $videoGallery = $('#main-gallery');
			$videoGallery.find('li').each(function () {
					var $this = $(this);
						video = $this.find('video').get(0);

					$this.find('video').load();
					$this.find('video').muted = true;
					$this.find('video').get(0).currentTime = 0.01;

					$this.on('mouseenter', function () {
						$this = $(this);
						$this.find('video').get(0).play();

					});

					$this.on('mouseleave', function () {
						$this = $(this);
						var video = $this.find('video').get(0);

						video.pause();
						video.currentTime = 0.01;
					});

				});

		})();

		// validation
		(function () {

			var $profileForms = $('form');
			$profileForms.validate();

		})();


		// scroll
		$(document).on('scroll', function () {
			var top;
			top = $(this).scrollTop();

			if (top < 2) {
				$('#main-navigation').removeClass('fixed');
			} else {
				$('#main-navigation').addClass('fixed');
			}
		});

		// resize
		$window.on('resize', function () {

			winWidth = $window.width();
			winHeight = $window.height();
			bodyHeight = $('body').height();

		});

});

// YouTube
(function () {
	var tag, firstScriptTag, youTube, playerDefaults, video, $mainVideoBackground;

	$mainVideoBackground = $('#main-video-background');
	
	tag = document.createElement('script');
	tag.src = 'https://www.youtube.com/player_api';

	firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	playerDefaults = {
		autoplay: 0,
		autohide: 1,
		modestbranding: 0,
		rel: 0,
		showinfo: 0,
		controls: 0,
		disablekb: 1,
		enablejsapi: 0,
		iv_load_policy: 3
	};

	video = {'videoId': 'sUfqmjM9_VE', 'startSeconds': 159, 'endSeconds': 1220};

	window.onYouTubePlayerAPIReady = function () {
		youTube = new YT.Player('main-video-background', {events: {'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange}, playerVars: playerDefaults});
	};

	window.onPlayerReady = function () {
		youTube.loadVideoById( video );
		youTube.mute();
	};

	window.onPlayerStateChange = function (e) {
		if (e.data === 1){
			$mainVideoBackground.addClass('playing');
		} else if (e.data === 0){
			youTube.seekTo( vid[randomvid].startSeconds );
		}
	};

	// $(window).on('load resize', function () {

	// 	var w = $(window).width() + 200,
	// 		h = $(window).height() + 200;

	// 	if (w/h > 16/9){
	// 		youTube.setSize(w, w/16*9);
	// 		$('.youTube .screen').css({
	// 			'left': '0px'
	// 		});
	// 	} else {
	// 		youTube.setSize(h/9*16, h);
	// 		$('.youTube .screen').css({'left': -( $('.tv .screen').outerWidth() - w )/2});
	// 	}
	// });

})();


/* ========================================================================
 * Bootstrap: collapse.js v3.3.6
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
	'use strict';

	// COLLAPSE PUBLIC CLASS DEFINITION
	// ================================

	var Collapse = function (element, options) {
		this.$element      = $(element);
		this.options       = $.extend({}, Collapse.DEFAULTS, options);
		this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
													 '[data-toggle="collapse"][data-target="#' + element.id + '"]')
		this.transitioning = null;

		if (this.options.parent) {
			this.$parent = this.getParent();
		} else {
			this.addAriaAndCollapsedClass(this.$element, this.$trigger);
		}

		if (this.options.toggle) this.toggle();
	};

	Collapse.VERSION  = '3.3.6';

	Collapse.TRANSITION_DURATION = 350;

	Collapse.DEFAULTS = {
		toggle: true
	};

	Collapse.prototype.dimension = function () {
		var hasWidth = this.$element.hasClass('width');
		return hasWidth ? 'width' : 'height';
	};

	Collapse.prototype.show = function () {
		if (this.transitioning || this.$element.hasClass('in')) return;

		var activesData;
		var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

		if (actives && actives.length) {
			activesData = actives.data('bs.collapse');
			if (activesData && activesData.transitioning) return;
		}

		var startEvent = $.Event('show.bs.collapse');
		this.$element.trigger(startEvent);
		if (startEvent.isDefaultPrevented()) return;

		if (actives && actives.length) {
			Plugin.call(actives, 'hide');
			activesData || actives.data('bs.collapse', null);
		}

		var dimension = this.dimension();

		this.$element
			.removeClass('collapse')
			.addClass('collapsing')[dimension](0)
			.attr('aria-expanded', true);

		this.$trigger
			.removeClass('collapsed')
			.attr('aria-expanded', true);

		this.transitioning = 1;

		var complete = function () {
			this.$element
				.removeClass('collapsing')
				.addClass('collapse in')[dimension]('');
			this.transitioning = 0;
			this.$element
				.trigger('shown.bs.collapse');
		};

		if (!$.support.transition) return complete.call(this);

		var scrollSize = $.camelCase(['scroll', dimension].join('-'));

		this.$element
			.one('bsTransitionEnd', $.proxy(complete, this))
			.emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
	};

	Collapse.prototype.hide = function () {
		if (this.transitioning || !this.$element.hasClass('in')) return;

		var startEvent = $.Event('hide.bs.collapse');
		this.$element.trigger(startEvent);
		if (startEvent.isDefaultPrevented()) return;

		var dimension = this.dimension();

		this.$element[dimension](this.$element[dimension]())[0].offsetHeight;

		this.$element
			.addClass('collapsing')
			.removeClass('collapse in')
			.attr('aria-expanded', false);

		this.$trigger
			.addClass('collapsed')
			.attr('aria-expanded', false);

		this.transitioning = 1;

		var complete = function () {
			this.transitioning = 0;
			this.$element
				.removeClass('collapsing')
				.addClass('collapse')
				.trigger('hidden.bs.collapse');
		};

		if (!$.support.transition) return complete.call(this);

		this.$element
			[dimension](0)
			.one('bsTransitionEnd', $.proxy(complete, this))
			.emulateTransitionEnd(Collapse.TRANSITION_DURATION);
	};

	Collapse.prototype.toggle = function () {
		this[this.$element.hasClass('in') ? 'hide' : 'show']();
	};

	Collapse.prototype.getParent = function () {
		return $(this.options.parent)
			.find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
			.each($.proxy(function (i, element) {
				var $element = $(element);
				this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
			}, this))
			.end();
	};

	Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
		var isOpen = $element.hasClass('in');

		$element.attr('aria-expanded', isOpen);
		$trigger
			.toggleClass('collapsed', !isOpen)
			.attr('aria-expanded', isOpen);
	};

	function getTargetFromTrigger($trigger) {
		var href;
		var target = $trigger.attr('data-target')
			|| (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

		return $(target);
	}


	// COLLAPSE PLUGIN DEFINITION
	// ==========================

	function Plugin(option) {
		return this.each(function () {
			var $this   = $(this);
			var data    = $this.data('bs.collapse');
			var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);

			if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
			if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)));
			if (typeof option == 'string') data[option]();
		});
	}

	var old = $.fn.collapse;

	$.fn.collapse             = Plugin;
	$.fn.collapse.Constructor = Collapse;


	// COLLAPSE NO CONFLICT
	// ====================

	$.fn.collapse.noConflict = function () {
		$.fn.collapse = old;
		return this;
	};


	// COLLAPSE DATA-API
	// =================

	$(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
		var $this   = $(this);

		if (!$this.attr('data-target')) e.preventDefault();

		var $target = getTargetFromTrigger($this);
		var data    = $target.data('bs.collapse');
		var option  = data ? 'toggle' : $this.data();

		Plugin.call($target, option);
	});

}(jQuery);
