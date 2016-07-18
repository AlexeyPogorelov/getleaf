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

			$mainNavigation.width( $body.width() );

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
