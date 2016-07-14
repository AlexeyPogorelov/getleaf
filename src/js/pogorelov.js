var _pogorelov = {};
var animationPrefix = (function () {
	var t,
	el = document.createElement("fakeelement");
	var transitions = {
		"WebkitTransition": "webkitAnimationEnd",
		"OTransition": "oAnimationEnd",
		"MozTransition": "animationend",
		"transition": "animationend"
	};
	for (t in transitions) {

		if (el.style[t] !== undefined) {

			return transitions[t];

		}

	}
})(),
transitionPrefix = (function () {
	var t,
	el = document.createElement("fakeelement");
	var transitions = {
		"WebkitTransition": "webkitTransitionEnd",
		"transition": "transitionend",
		"OTransition": "oTransitionEnd",
		"MozTransition": "transitionend"
	};
	for (t in transitions) {

		if (el.style[t] !== undefined) {

			return transitions[t];

		}

	}
})(),
requestAnimFrame = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame    ||
window.oRequestAnimationFrame      ||
window.msRequestAnimationFrame     ||
function( callback ){
	window.setTimeout( callback, 17 );
},
bodyOverflow = (function () {
	var $body = $('body'),
		$mainNavigation = $('.main-navigation');
	return {
		fixBody: function () {

			$body.width( $body.width() )
				.addClass('fixed');

			$mainNavigation.width( $body.width() - 80 );

		},
		unfixBody: function () {

			$body
				.css({
					'width': 'auto'
				})
				.removeClass('fixed');

			$mainNavigation.width('');

		},
		resize: function () {

			this.unfixBody();
			setInterval(this.fixBody, 10)

		}.bind(this)
	};
})();

(function ($) {

$.fn.simpleSlider = function (opt) {

	// options
	if (!opt) {
		opt = {};
	}
	opt = $.extend({
		'autoHeight': false,
		'clickToNext': true,
		'easing': 'swing',
		'holderClass': 'slides-holder',
		'interval': false,
		'loop': true,
		'mouseDrug': false,
		'mouseWheel': false,
		'nextClass': 'arrow-right',
		'preloaderClass': 'slide',
		'prevClass': 'arrow-left',
		'sectionClass': 'section',
		'slideClass': 'slide',
		'slidesOnPage': 1,
		'speed': 400,
		'startSlide': 0,
		'touch': true,
		'viewportClass': 'viewport'
	}, opt);

	var plugin = function (i) {

		var DOM = {},
			state = {
				'touchStart': {},
				'touchEnd': {}
			},
			self = this,
			$window = $(window),
			touchendCleaner = function () {
				DOM.$sliderHolder.removeClass('touched');
				state.touchStart.yPos = 0;
				state.touchStart.xPos = 0;
				state.shiftX = 0;
				state.shiftD = 0;
			};

		// methods
		var plg = {
			cacheDOM: function () {
				DOM.$slider = $(self);
				DOM.$section = $(self).closest('.' + opt.sectionClass);
				DOM.$preloader = DOM.$slider.find('.' + opt.preloaderClass);
				DOM.$viewport = DOM.$slider.find('.' + opt.viewportClass);
				DOM.$sliderHolder = DOM.$viewport.find('.' + opt.holderClass);
				DOM.$slides = DOM.$slidesAndCloned = DOM.$sliderHolder.find('.' + opt.slideClass);
				DOM.$slides.eq( state.current || 0 ).addClass('active');
			},
			init: function () {

				plg.cacheDOM();

				state.current = state.current || 0;
				state.slides = DOM.$slides.length;
				state.pages = Math.ceil(DOM.$slides.length / opt.slidesOnPage);

				if (this.initialized) return false;

				if (opt.loop) {

					DOM.$slides.each(function (i) {
						$(this)
							.clone()
							.addClass('cloned')
							.insertBefore( DOM.$slides.eq(0) )
							.clone()
							.appendTo( DOM.$sliderHolder );
					});

					DOM.$slidesAndCloned = DOM.$sliderHolder.find(opt.slideClass);

					this.addIdsToSlides();

				}

				if (opt.slidesClickable) {
					this.addHandlersToSlides();
				}

				DOM.$preloader.fadeOut(150);

				this.initialized = true;

				plg.resize();

			},
			addIdsToSlides: function () {

				DOM.$slides.not('.cloned').each(function (i) {
					$(this).attr('data-id', i);
				});

			},
			addHandlersToSlides: function () {

				DOM.$slides.not('.cloned').each(function (i) {
					var $self = $(this);
					$self.find('a').on('click', function (e) {
						if (!$self.hasClass('active')) {
							e.preventDefault();
							if (i > state.current) {
								plg.nextSlide();
							} else {
								plg.prevSlide();
							}
						}
					});
				});

				DOM.$slidesAndCloned.filter('.cloned').find('a').on('click', function (e) {
					e.preventDefault();
					plg.fakeAnimation( $(this).closest(opt.slideClass).data('id') );
				});

			},
			calculateMaxHeight: function ($el) {

				var max = 1;

				$el.each(function () {

					var height = 0,
						$self = $(this);

					$self.find('> *').each(function () {
						height += $self.outerHeight();
					});

					if (height > max) {
						max = height;
					}

				});

				return max;

			},
			resize: function () {

				state.sliderWidth = DOM.$viewport.width();

				if ($window.width() > 300 && opt.slidesOnPage > 1 && $window.width() <= 700) {

					opt.slidesOnPage = Math.floor( opt.slidesOnPage / 2 );
					plg.init();

				}

				state.itemWidth = DOM.$viewport.width() / opt.slidesOnPage;

				DOM.$slidesAndCloned.width( state.itemWidth );

				if (opt.autoHeight) {

					DOM.$slides.height( this.calculateMaxHeight( DOM.$slides ) );

				}

				state.slideWidth = DOM.$slides.eq(0).outerWidth();

				if (opt.loop) {

					state.holderWidth = 3 * state.slides * state.slideWidth;

				} else {

					state.holderWidth = state.slideWidth * state.slides;

				}

				DOM.$sliderHolder.width( state.holderWidth );

				plg.toSlide(state.current, true);

			},
			prevSlide: function () {

				var id = state.current - 1;
				if (id < 0) {

					plg.fakeAnimation( state.pages - 1 );

					return;

				}

				plg.toSlide(id);

			},
			nextSlide: function () {

				var id = state.current + 1;
				if (id >= state.pages) {

					plg.fakeAnimation( 0 );

					return;

				}

				plg.toSlide(id);

			},
			fakeAnimation: function (id) {

				var direction = state.current > id ? true : false;

				// console.log(state.animated);
				if (state.animated) {
					state.doAfterTransition = function () {
						plg.fakeAnimation(id);
					};
					return;
				}

				DOM.$sliderHolder.addClass('touched');

				if (direction) {

					DOM.$slides.eq(id).addClass('unpressed');
					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -( state.sliderWidth * (id + state.slides - 1) ) + 'px) translateZ(0)'
					});

				} else {

					DOM.$slides.eq(id).addClass('pressed');
					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -( state.sliderWidth * (id + state.slides + state.current + 1) ) + 'px) translateZ(0)'
					});

				}

				setTimeout(function () {

					DOM.$sliderHolder.removeClass('touched');
					DOM.$slides.eq(id).removeClass('pressed unpressed');

					plg.toSlide(id);

				}, $.browser.mobile ? 100 : 40);

			},
			toSlide: function (id, resize) {

				if ( id < 0 || id >= state.pages ) {
					console.warn('id is ' + id);
					return;
				}

				state.current = id;

				if ( DOM.$sliderHolder.hasClass('touched') || resize ) {

					state.animated = false;

				} else {

					state.animated = true;

				}

				if (opt.loop) {

					DOM.$slidesAndCloned.removeClass('active fake-active');
					DOM.$slidesAndCloned.filter('[data-id="' + id + '"]').each(function () {
						$self = $(this);
						if ($self.hasClass('cloned')) {
							$self.addClass('fake-active');
						} else {
							$self.addClass('active');
						}
					});

				} else {

					DOM.$slides.removeClass('active').eq(id).addClass('active');

				}

				if (opt.pagination) {

					DOM.$pagination.find('.page').eq(id).addClass('active').siblings().removeClass('active');

				}

				// TODO add class
				// DOM.$slider.addClass('animated');

				if (opt.loop) {

					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -( state.sliderWidth * (id + state.slides) ) + 'px) translateZ(0)',
						'transition': 'transform ' + opt.speed + 'ms'
					});

				} else {

					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -(state.sliderWidth * id) + 'px) translateZ(0)',
						'transition': 'transform ' + opt.speed + 'ms'
					});

				}

			},
			transitionEnded: function (e) {

				if (this !== e.target) return;

				state.animated = false;

				DOM.$sliderHolder.css({
					'transition': 'none'
				});

				// todo add class
				// DOM.$slider.removeClass('animated');

				if (typeof state.doAfterTransition === 'function') {

					setTimeout(function () {

						state.doAfterTransition();
						state.doAfterTransition = null;

					}, 10);

				}

				pagesState.lastScrollTime = new Date().getTime();

			},
			getCurrent: function () {
				return state.current;
			}
		};

		plg.init();

		// resize
		$window.on('resize', function () {
			plg.resize();
		});

		// click events
		DOM.$slider.on('click', function (e) {

			var $target = $(e.target);

			if ($target.hasClass('page')) {

				plg.toSlide($(e.target).data('page'));

			} else if ($target.hasClass('prev-slide')) {

				plg.prevSlide();

			} else if ($target.hasClass('next-slide')) {

				plg.nextSlide();

			} else if (opt.clickToNext && $target.parents(opt.slideClass).length) {

				plg.nextSlide();

			}

		});

		if (opt.mouseWheel) {

			DOM.$slider.on('DOMMouseScroll wheel', function (e) {

				e.preventDefault();
				e.stopPropagation();

				var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
				if ( pagesState.lastScrollTime + opt.speed < new Date().getTime() ) {

					if (delta > 0) {

						plg.prevSlide();

					} else if (delta < 0) {

						plg.nextSlide();

					}

				}

			}).on('mousewheel', function (e) {

				e.preventDefault();
				e.stopPropagation();

				var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
				if ( pagesState.lastScrollTime + opt.speed < new Date().getTime() ) {

					if (delta > 0) {

						plg.prevSlide();

					} else if (delta < 0) {

						plg.nextSlide();

					}

				}

			});

		}

		if (opt.touch) {

			// drag events
			DOM.$slider.on('touchstart', function (e) {
				state.touchStart.timeStamp = e.timeStamp;
			}).on('touchmove', function (e) {

				state.touchEnd.xPos = e.originalEvent.touches[0].clientX;
				state.touchEnd.yPos = e.originalEvent.touches[0].clientY;

				if (!state.touchStart.xPos) {

					state.touchStart.xPos = e.originalEvent.touches[0].clientX;

				}

				if (!state.touchStart.yPos) {

					state.touchStart.yPos = e.originalEvent.touches[0].clientY;

				}

			}).on('touchend touchcancel', function (e) {
				// TODO reformat it
				var distance = 70,
					speed = opt.speed || 200,
					deltaX = state.touchEnd.xPos - state.touchStart.xPos,
					deltaY = Math.abs(state.touchEnd.yPos - state.touchStart.yPos);

				state.touchEnd.xPos = 0;
				state.touchEnd.yPos = 0;
				if (deltaX > distance || -deltaX > distance) {
					if (deltaX < 0) {

						if (state.animated) {

							state.doAfterTransition = plg.nextSlide;

						} else {

							plg.nextSlide();

						}

					} else {

						if (state.animated) {

							state.doAfterTransition = plg.prevSlide;

						} else {

							plg.prevSlide();

						}

					}
				}
				// TODO replace it by function
				deltaX = null;
				deltaY = null;
				state.touchEnd.xPos = null;
				state.touchEnd.yPos = null;
				state.touchStart.xPos = null;
				state.touchStart.yPos = null;
			});
		}

		if (opt.mouseDrug) {

			DOM.$section.on('mousedown', function (e) {
				DOM.$sliderHolder.addClass('touched');
				state.touchStart.xPos = e.pageX;
				state.touchStart.yPos = e.pageY;
				try {

					state.touchStart.trfX = -parseInt( DOM.$sliderHolder.css('transform').split(',')[4] );

				} catch (error) {

					console.warn('transform is undefined');
					console.log(error);

				}

			}).on('mousemove', function (e) {
				if (e.buttons < 1) {
					touchendCleaner ();
				} else if (state.touchStart.xPos) {

					state.shiftD = state.touchStart.xPos - e.pageX;
					state.shiftX = state.touchStart.trfX + state.shiftD;

					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -state.shiftX + 'px) translateZ(0)'
					});

				}
			}).on('mouseup mouseleave', function (e) {
				if ( Math.abs(state.shiftD) > 40 ) {
					if (state.shiftD > 0) {
						plg.nextSlide();
					} else {
						plg.prevSlide();
					}
				} else {
					plg.toSlide(state.current);
				}
				touchendCleaner ();
			});

		}

		DOM.$sliderHolder.on(transitionPrefix, plg.transitionEnded);

		return plg;
	};

	if (this.length > 1) {

		return this.each(plugin);

	} else if (this.length === 1) {

		return plugin.call(this[0]);

	}

};

$.fn.scrollSlider = function (opt) {

	// options
	if (typeof opt !== 'object') opt = {};
	opt = $.extend({
		'loop': false,
		'mouseDrug': false,
		'mouseWheel': false,
		'nextClass': 'next-slide',
		'padding': 40,
		'pageClass': 'page',
		'pagination': false,
		'preloaderClass': 'preloader',
		'prevClass': 'prev-slide',
		'screenMaxWidth': 760,
		'slideClass': 'slide',
		'slideNameSpinner': false,
		'slideNamesHolderClass': 'names-holder',
		'slideNameClass': 'name',
		'slidesHolderClass': 'slider-holder',
		'slidesOnPage': 1,
		'speed': 400,
		'touch': true,
		'viewportClass': 'viewport'
	}, opt);

	var plugin = function (i) {

		var DOM = {},
			// current - current page
			// slides - count of slides
			state = {
				'touchStart': {},
				'touchEnd': {}
			},
			self = this,
			$window = $(window);

		// methods
		var plg = {
			cacheDOM: function () {
				DOM.$slider = $(self);
				DOM.$preloader = DOM.$slider.find('.' + opt.preloaderClass);
				DOM.$viewport = DOM.$slider.find('.' + opt.viewportClass);
				DOM.$slidesHolder = DOM.$slider.find('.' + opt.slidesHolderClass);
				DOM.$slides = DOM.$slidesHolder.find('.' + opt.slideClass);
				if (opt.slideNameSpinner) {
					DOM.$namesHolder = DOM.$slider.find('.' + opt.slideNamesHolderClass);
					DOM.$namesSlider = $('<div class="names-slider">').appendTo( DOM.$namesHolder );
				}
			},
			init: function () {

				this.cacheDOM();

				this.touchStatusCleaner();
				state.current = state.current || 0;
				state.slides = DOM.$slides.length || 0;
				state.pages = Math.ceil(state.slides / opt.slidesOnPage);


				if (this.initialized) {
					this.resize();
					return false;
				}

				// name
				if (opt.slideNameSpinner) this.buildNamesSpinner();

				// click events
				DOM.$slider.on('click', plg.globalClickHandler);

				DOM.$preloader.fadeOut(150);

				this.initialized = true;

				this.resize();

				// drag events
				if (opt.touch) {
					DOM.$slider
						.on('touchstart', plg.touchstart)
						.on('touchmove', plg.touchmove)
						.on('touchend touchcancel', plg.touchend);
				}

				// console.log(state)

			},
			uninit: function () {
				this.initialized = false;
			},
			buildNamesSpinner: function () {
				DOM.$namesSlider
					.empty();
				DOM.$slides
					.each(function () {
						var $name = $( '<span>' + $(this).attr('data-name') + '</span>' );
						DOM.$namesSlider.append( $name );
					});
				DOM.$names = DOM.$namesSlider.find( '> span' );
			},
			applyBaseStyles: function () {
				DOM.$viewport.css({
					'overflow': 'hidden'
				});
				DOM.$slidesHolder.width( state.holderWidth );
			},
			removeBaseStyles: function () {
				DOM.$viewport.css({
					'overflow': ''
				});
				DOM.$slidesHolder.css({
					'width': ''
				});
				DOM.$slides.css({
					'width': ''
				});
			},
			resize: function () {

				state.slideWidth = DOM.$viewport.width() - opt.padding;
				state.itemWidth = DOM.$viewport.width() / opt.slidesOnPage;

				DOM.$slides.width( DOM.$viewport.width() - opt.padding * 2);

				state.holderWidth = state.slideWidth * state.slides;

				if (opt.slideNameSpinner) {
					state.namesHolderWidth = DOM.$namesHolder.width();
				}

				plg.toSlide(state.current, true);

				if ($window.width() > opt.screenMaxWidth) {
					this.removeBaseStyles();
				} else {
					this.applyBaseStyles();
				}

			},
			prevSlide: function () {

				var id = state.current - 1;
				if (id < 0) {

					if (opt.loop) {
						id = state.pages - 1;
					} else {
						id = state.current;
					}

				}

				plg.toSlide(id);

			},
			nextSlide: function () {

				var id = state.current + 1;
				if (id >= state.pages) {

					if (opt.loop) {
						id = 0;
					} else {
						id = state.current;
					}

				}

				plg.toSlide(id);

			},
			toSlide: function (id, resize) {

				if ( id < 0 || id >= state.pages ) {
					console.warn('id is ' + id);
					return;
				}

				state.current = id;

				if (opt.pagination) {

					DOM.$pagination
						.find('.page')
						.eq(id)
						.addClass('active')
						.siblings()
						.removeClass('active');

				}

				// TODO add class
				// DOM.$slider.addClass('animated');

				// DOM.$slidesHolder.animate({
				// 	'scrollLeft': state.current * state.holderWidth
				// })

				DOM.$slidesHolder.css({
					'transform': ' translateX(' + -state.current * state.slideWidth + 'px)'
				});

				if (opt.slideNameSpinner) {
					DOM.$namesSlider.css({
						'transform': ' translateX(' + -state.current * state.namesHolderWidth + 'px)'
					});
					DOM.$names
						.eq(id)
						.addClass('active')
						.siblings()
						.removeClass('active');
				}

			},
			globalClickHandler: function (e) {

				var $target = $(e.target);

				if ($target.hasClass(opt.pageClass)) {

					plg.toSlide($(e.target).data('page'));

				} else if ($target.hasClass(opt.prevClass)) {

					plg.prevSlide();

				} else if ($target.hasClass(opt.nextClass)) {

					plg.nextSlide();

				}
				// else if (opt.clickToNext && $target.parents(opt.slideClass).length) {
				// 	plg.nextSlide();
				// }

			},
			touchstart: function (e) {
				state.touchStart.timeStamp = e.timeStamp;

				state.touchStart.translateX = DOM.$slidesHolder.css('transform');
				if (!state.touchStart.translateX) return;
				state.touchStart.translateX = state.touchStart.translateX.split(', ');
				state.touchStart.translateX = state.touchStart.translateX[4];
				state.touchStart.translateX = parseFloat(state.touchStart.translateX);

			},
			touchmove: function (e) {

				var deltaX;

				if (!state.touchStatus) {
					DOM.$slidesHolder.addClass('touched');
					state.touchStatus = true;
				}

				state.touchEnd.xPos = e.originalEvent.touches[0].clientX;
				state.touchEnd.yPos = e.originalEvent.touches[0].clientY;

				if (!state.touchStart.xPos) {
					state.touchStart.xPos = e.originalEvent.touches[0].clientX;
				}

				if (!state.touchStart.yPos) {
					state.touchStart.yPos = e.originalEvent.touches[0].clientY;
				}

				deltaX = state.touchEnd.xPos - state.touchStart.xPos;

				// console.log( state.touchStart.translateX )
				// console.log( deltaX )
				DOM.$slidesHolder.css({
					'transform': ' translateX(' + (deltaX + state.touchStart.translateX) + 'px)'
				});

				if (deltaX > 10 || deltaX < -10) e.preventDefault();

			},
			touchend: function (e) {
				// TODO reformat it
				var distance = state.slideWidth / 4,
					deltaX = state.touchEnd.xPos - state.touchStart.xPos;

				state.touchStatus = false;
				DOM.$slidesHolder.removeClass('touched');

				if (deltaX > distance || -deltaX > distance) {
					if (deltaX < 0) {
						plg.nextSlide();
					} else {
						plg.prevSlide();
					}
				} else {
					plg.toSlide( state.current );
				}

				plg.touchStatusCleaner();
			},
			touchStatusCleaner: function () {
				state.touchStart = {};
				state.touchEnd = {};
			}
		};

		plg.init();

		// resize
		$window.on( 'resize', plg.resize.bind(plg) );

		if (opt.mouseWheel) {

			DOM.$slider.on('DOMMouseScroll wheel', function (e) {

				e.preventDefault();
				e.stopPropagation();

				var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
				if ( pagesState.lastScrollTime + opt.speed < new Date().getTime() ) {

					if (delta > 0) {

						plg.prevSlide();

					} else if (delta < 0) {

						plg.nextSlide();

					}

				}

			}).on('mousewheel', function (e) {

				e.preventDefault();
				e.stopPropagation();

				var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
				if ( pagesState.lastScrollTime + opt.speed < new Date().getTime() ) {

					if (delta > 0) {

						plg.prevSlide();

					} else if (delta < 0) {

						plg.nextSlide();

					}

				}

			});

		}

		if (opt.mouseDrug && false) {

			DOM.$slider.on('mousedown', function (e) {
				DOM.$sliderHolder.addClass('touched');
				state.touchStart.xPos = e.pageX;
				state.touchStart.yPos = e.pageY;
				try {

					state.touchStart.trfX = -parseInt( DOM.$sliderHolder.css('transform').split(',')[4] );

				} catch (error) {

					console.warn('transform is undefined');
					console.log(error);

				}

			}).on('mousemove', function (e) {
				if (e.buttons < 1) {
					touchendCleaner ();
				} else if (state.touchStart.xPos) {

					state.shiftD = state.touchStart.xPos - e.pageX;
					state.shiftX = state.touchStart.trfX + state.shiftD;

					DOM.$sliderHolder.css({
						'transform': 'translateX( ' + -state.shiftX + 'px) translateZ(0)'
					});

				}
			}).on('mouseup mouseleave', function (e) {
				if ( Math.abs(state.shiftD) > 40 ) {
					if (state.shiftD > 0) {
						plg.nextSlide();
					} else {
						plg.prevSlide();
					}
				} else {
					plg.toSlide(state.current);
				}
				touchendCleaner ();
			});

		}

		return plg;
	};

	if (this.length > 1) {

		return this.each(plugin);

	} else if (this.length === 1) {

		return plugin.call(this[0]);

	}

};

// Collapse

$.fn.collapse = function (opt) {

	// options
	if (typeof opt !== 'object') opt = {};

	opt = $.extend({
		'opened': false,
		'panelClass': 'panel',
		'triggerClass': 'panel-heading',
		'collapseClass': 'panel-collapse'
	}, opt);


	var plugin = function (i) {
		var $self = $(this),
			DOM = {},
			state = {},
			$window = $(window);
		var plg = {
			init: function () {
				if (!state.initialized) {
					this.cacheDOM();
					this.bindEvents();
					state.initialized = true;
				}
				this.resize();
				if (typeof opt.opened === 'number') {
					this.hideAll();
					this.show(DOM.$panels.eq(opt.opened), DOM.collapses[opt.opened], opt.opened);
				} else {
					state.opened = null;
					this.hideAll();
				}
			},
			cacheDOM: function () {
				DOM.$panels = $self.find('.' + opt.panelClass);
				DOM.collapses = [];
				DOM.triggers = [];
				DOM.$panels.each(function () {
					var $self = $(this);
					DOM.collapses.push( $self.find('.' + opt.collapseClass) );
					DOM.triggers.push( $self.find('.' + opt.triggerClass) );
				});
			},
			bindEvents: function () {
				DOM.$panels.each(function (i) {
					var $self = $(this),
						$trigger = DOM.triggers[i],
						$collapse = DOM.collapses[i];
					$trigger
						.on('click', function (e) {
							e.preventDefault();
							plg.clickTrigger(
								$self,
								$collapse,
								i
							);
						});
				});
				$window.on('resize', this.resize);
			},
			show: function ($panel, $collapse, i) {
				if (typeof state.opened === 'number') {
					this.hide(DOM.$panels.eq(state.opened), DOM.collapses[state.opened], state.opened);
				}

				state.opened = i;
				$panel.removeClass('collapsed');
				// console.log( $collapse.data('fullHeight') )
				$collapse.css('height', $collapse.data('fullHeight'));
			},
			hide: function ($panel, $collapse, i) {
				if (i === state.opened) state.opened = null;
				// console.log( $collapse )
				$panel.addClass('collapsed');
				$collapse.css('height', '');
			},
			clickTrigger: function ($panel, $collapse, i) {
				if ($panel.hasClass('collapsed')) {
					this.show( $panel, $collapse, i );
				} else {
					this.hide( $panel, $collapse, i );
				}

			},
			hideAll: function () {
				DOM.$panels.each(function (i) {
					this.hide(DOM.$panels.eq(i), DOM.collapses[i], i);
				}.bind(this));
			},
			resize: function () {
				for (var i = 0; i < DOM.collapses.length; i++) {
					DOM.collapses[i].data(
						'fullHeight',
						DOM.collapses[i].prop('scrollHeight')
					);
				}
			}
		};

		plg.init();

		return plg;
	};

	if (this.length > 1) {

		return this.each(plugin);

	} else if (this.length === 1) {

		return plugin.call(this[0]);

	}
};

$.fn.validate = function (opt) {

	this.each(function (i) {

		var DOM = {},
			state = {},
			$self = $(this);

		// options
		if (!opt) {
			opt = {};
		}
		opt = $.extend({
		}, opt);

		// methods
		var plg = {
			init: function () {

				DOM.$fields = $self.find('[data-validate]');
				$self.find('[type="submit"]').on('click', plg.submit);
				DOM.$fields.on('focus', function () {
					plg.removeLabel( $(this) );
				});

			},
			test: function (data, type) {

				switch (type) {
					case 'name':
						return /^[а-яА-Яa-zA-Z\-]+\s{0,1}[а-яА-Яa-zA-Z\-]{0,}$/.test(data);
					case 'phone':
						return /^[\(\)0-9\-\s\+]{8,}/.test(data);
					case 'email':
						return /^[0-9a-zA-Z._-]+@[0-9a-zA-Z_-]+\.[a-zA-Z._-]+/.test(data);
					default:
						return true;
				}

			},
			addLabel: function ($el) {

				$el.parent().addClass('error');

			},
			removeLabel: function ($el) {

				$el.parent().removeClass('error');

			},
			validate: function ($el) {

				if ( $el.hasClass('skip') ) return;

				if ( plg.test( $el.val(), $el.data('validate') ) ) {

					plg.removeLabel( $el );

				} else {

					plg.addLabel( $el );
					state.errors++;

				}

			},
			submit: function (e) {

				state.errors = 0;
				DOM.$fields.each( function () {

					plg.validate( $(this) );

				} );

				if (state.errors) {

					e.preventDefault();

				}

			}

		};

		plg.init();

		return plg;

	});

};


})(jQuery);
