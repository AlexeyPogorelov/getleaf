
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

		getleaf.iframesResize();

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

				if (e.target === this && winWidth > 1000 ) {

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

					if ( this.opened.length === 0 && !$modal ) {

						return;

					} else if ( this.opened.length > 0 && !$modal ) {

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

						// stop YouTube modal video
						if( $modal.attr('id') === 'main-video-modal' && getleaf.video) getleaf.video.pauseVideo();

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

		// #interactive
		var interactive = (function () {
			var activeTab = 0,
				$moreAbout = $('#more-about'),
				$tabs = $moreAbout.find('.tabs-holder'),
				$interactive = $moreAbout.find('#interactive, #mobileapp');
			$tabs.find('[data-tab="interactive"]')
				.on('click', function () {
					$(this).addClass('active').siblings().removeClass('active');
					$interactive.css({
						'transform': 'translateX(0px)'
					});
					activeTab = 0;
				});
			$tabs.find('[data-tab="mobileapp"]')
				.on('click', function () {
					$(this).addClass('active').siblings().removeClass('active');
					$interactive.css({
						'transform': 'translateX(' + -winWidth + 'px)'
					});
					activeTab = 1;
				});
			$window.on('resize', function () {
				if (activeTab === 1) {
					$interactive.css({
						'transform': 'translateX(' + -winWidth + 'px)'
					});
				}
			});
			$interactive
				.find('.layer-trigger-1, .layer-trigger-2, .layer-trigger-3, .layer-trigger-4, .layer-trigger-5, .layer-trigger-6, .layer-trigger-7, .layer-trigger-8, .layer-trigger-9')
				.hover(
						function () {
							$interactive.addClass('tooltip-visible');
						},
						function () {
							$interactive.removeClass('tooltip-visible');
						}
					);

		})();

		// notifications
		getleaf.notification = (function () {
			var opened = [],
				lastTop = 0;

			options = {
				'notificationClass': 'notification',
				'marginTop': 10,
				'timeout': 10000
			};

			var plg = {
				show: function ( text, selector ) {
					var $notification, $parent;

					if (!(typeof text === 'string' && text.length > 1)) return false;

					$notification = plg.create( text );

					if (selector) {
						$parent = $( selector );
					} else {
						$parent = $('body');
					}
					if ($parent.length < 1) $parent = $('body');
					$notification
						.appendTo( $parent )
						.one( animationPrefix, function () {
							plg.hide( $notification );
						});

					setTimeout(function() {
						plg.hide( $notification );
					}, options.timeout);

				},
				hide: function ($notification) {

					for ( var y = 0; y < opened.length; y++ ) {

						if ($notification === opened[y]) {
							opened.splice(y, 1);
							$notification.remove();
						}

					}

					if (opened.length === 0) {
						lastTop = 0;
					}

				},
				calculateTop: function () {
					var top = 0;
					for (var i = 0; i < opened.length; i++) {
						top += opened[i].prop('scrollHeight') + options.marginTop;
					}
					return top;
				},
				create: function (text) {
					var top = lastTop + options.marginTop;
					$notification = $('<div>')
						.addClass(options.notificationClass)
						.css({
							'top': top
						})
						.html( text );
					setTimeout(function() {
						lastTop = top + $notification.prop('scrollHeight');
						opened.push($notification);
					}, 1);
					return $notification;
				}

			};

			return plg.show;
		})();

		// copy text
		(function () {
			var $triggers = $('[data-copy]');

			$triggers.on('click', function() {
				var $self = $(this),
					$target = $( $self.attr('data-copy') );

				if ($target.length === 0) return;

				$target.get(0).select();

				try {
					document.execCommand('copy');
					getleaf.notification('link copied');
				} catch (e) {
					getleaf.notification('Unable to copy');
					console.error(e);
				}
			});

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

			$videoGallery.find('.mobile-show-more').each(function () {
			});

		})();

		// validation
		(function () {

			var $profileForms = $('form');
			$profileForms.validate();

		})();

		// Collapse
		$('#faq').collapse();

		// navigation
		(function () {
			var $htmlBody = $("html, body");
			// TODO refactor

			$('.navigation-pannel').find('a').not('[target="_blank"]').on('click', function (e) {
				e.preventDefault();
				var $self = $(this);
				$self.addClass('active');
				$self.parent().siblings().find('> a').removeClass('active');
				var $target = $( $self.attr('href') );
				if ($target.length) {
					$htmlBody
						.stop()
						.one('mousewheel DOMMouseScroll touchstar', function () {
							$htmlBody.stop(false, false);
						});
					setTimeout(function () {
						$htmlBody
						.animate({scrollTop:$target.offset().top - 65}, 800, 'swing');
					}, 40);

				}
				modals.closeModal();
			});

		})();

		// scroll
		(function () {

			var $mainNavigation, mainNavigationFixed;
			$mainNavigation = $('#main-navigation');
			mainNavigationFixed = 0;

			$(document).on('scroll', function () {
				var top;
				top = $(this).scrollTop();

				if ( top < 6 ) {
					if (mainNavigationFixed === 1) return;
					$mainNavigation.removeClass('fixed');
					mainNavigationFixed = 1;
				} else {
					if (mainNavigationFixed === 2) return;
					$mainNavigation.addClass('fixed');
					mainNavigationFixed = 2;
				}
			});

		})();

		// show more
		(function () {

			var $show = $('[data-show]');
			$show.on('click', function (e) {
				e.preventDefault();
				var $target,
					selector;
				selector = $(this).attr('data-show');
				$target = $( selector );
				$target.toggleClass('opened');
			});

		})();

		// resize
		var iframes = getleaf.iframesResize = (function () {
			var $iframes = $('iframe');
			var plg = {
				resize: function () {
					var iframeWin = this.contentWindow || this.contentDocument.parentWindow;
					if (iframeWin.document.body) {
						this.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
					}
				},
				resizeIframes: function () {
					$iframes.each(plg.resize);
				}
			};

			$iframes.on('load', plg.resize);
			$window.on('resize', plg.resizeIframes);

			return {
				resize: plg.resize,
				resizeIframes: plg.resizeIframes
			};

		})();

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
		controls: 1,
		disablekb: 1,
		enablejsapi: 0,
		iv_load_policy: 3
	};

	video = {'videoId': 'XdPbgNkAs5k'};

	window.onYouTubePlayerAPIReady = function () {
		youTube = new YT.Player('main-video-background', {events: {'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange}, playerVars: playerDefaults});
	};

	window.onPlayerReady = function () {
		// youTube.loadVideoById( video );
		// youTube.mute();
		// youTube.pauseVideo();
		getleaf.video = youTube;
	};
	window.onPlayerStateChange = function (e) {
		// console.log(e.data)
		// if (e.data === 3) {
		// 	youTube.stopVideo();
		// }
	};

	$('[data-modal="#main-video-modal"]').one('click', function () {
		youTube.loadVideoById( video );
	});

})();
