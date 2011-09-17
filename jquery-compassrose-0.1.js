/*
 * jQuery UI Effects @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
;jQuery.effects || (function($, undefined) {

var backCompat = $.uiBackCompat !== false;

$.effects = {
	effect: {}
};

/******************************************************************************/
/****************************** COLOR ANIMATIONS ******************************/
/******************************************************************************/

// override the animation for color styles
$.each(["backgroundColor", "borderBottomColor", "borderLeftColor",
	"borderRightColor", "borderTopColor", "borderColor", "color", "outlineColor"],
function(i, attr) {
	$.fx.step[attr] = function(fx) {
		if (!fx.colorInit) {
			fx.start = getColor(fx.elem, attr);
			fx.end = getRGB(fx.end);
			fx.colorInit = true;
		}

		fx.elem.style[attr] = "rgb(" +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0) + ")";
	};
});

// Color Conversion functions from highlightFade
// By Blair Mitchelmore
// http://jquery.offput.ca/highlightFade/

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor === Array && color.length === 3 )
				return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
				return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
				return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
				return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
				return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
		if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
				return colors["transparent"];

		// Otherwise, we're most likely dealing with a named color
		return colors[$.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
		var color;

		do {
				color = $.curCSS(elem, attr);

				// Keep going until we find an element that has color, or we hit the body
				if ( color != "" && color !== "transparent" || $.nodeName(elem, "body") )
						break;

				attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
};

// Some named colors to work with
// From Interface by Stefan Petre
// http://interface.eyecon.ro/

var colors = {
	aqua:[0,255,255],
	azure:[240,255,255],
	beige:[245,245,220],
	black:[0,0,0],
	blue:[0,0,255],
	brown:[165,42,42],
	cyan:[0,255,255],
	darkblue:[0,0,139],
	darkcyan:[0,139,139],
	darkgrey:[169,169,169],
	darkgreen:[0,100,0],
	darkkhaki:[189,183,107],
	darkmagenta:[139,0,139],
	darkolivegreen:[85,107,47],
	darkorange:[255,140,0],
	darkorchid:[153,50,204],
	darkred:[139,0,0],
	darksalmon:[233,150,122],
	darkviolet:[148,0,211],
	fuchsia:[255,0,255],
	gold:[255,215,0],
	green:[0,128,0],
	indigo:[75,0,130],
	khaki:[240,230,140],
	lightblue:[173,216,230],
	lightcyan:[224,255,255],
	lightgreen:[144,238,144],
	lightgrey:[211,211,211],
	lightpink:[255,182,193],
	lightyellow:[255,255,224],
	lime:[0,255,0],
	magenta:[255,0,255],
	maroon:[128,0,0],
	navy:[0,0,128],
	olive:[128,128,0],
	orange:[255,165,0],
	pink:[255,192,203],
	purple:[128,0,128],
	violet:[128,0,128],
	red:[255,0,0],
	silver:[192,192,192],
	white:[255,255,255],
	yellow:[255,255,0],
	transparent: [255,255,255]
};



/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	},
	// prefix used for storing data on .data()
	dataSpace = "ec.storage.";

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function(_, prop) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles() {
	var style = document.defaultView
			? document.defaultView.getComputedStyle(this, null)
			: this.currentStyle,
		newStyle = {},
		key,
		camelCase,
		len;

	// webkit enumerates style porperties
	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				newStyle[ $.camelCase( key ) ] = style[ key ];
			}
		}
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				newStyle[ key ] = style[ key ];
			}
		}
	}

	return newStyle;
}


function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] != value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ),
			finalClass,
			allAnimations = o.children ? animated.find( "*" ).andSelf() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				originalStyleAttr: el.attr( "style" ) || " ",
				start: getElementStyles.call( this )
			};
		});

		// apply class change
		$.each( classAnimationActions, function(i, action) {
			if ( value[ action ] ) {
				animated[ action + "Class" ]( value[ action ] );
			}
		});
		finalClass = animated.attr( "class" );

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles.call( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred();

			this.el.animate( this.diff, {
				duration: o.duration,
				easing: o.easing,
				queue: false,
				complete: function() {
					dfd.resolve( styleInfo );
				}
			});
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			animated.attr( "class", finalClass );

			// for each animated element
			$.each( arguments, function() {
				if ( typeof this.el.attr( "style" ) === "object" ) {
					this.el.attr( "style" ).cssText = "";
					this.el.attr( "style" ).cssText = this.originalStyleAttr;
				} else {
					this.el.attr( "style", this.originalStyleAttr );
				}
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	_addClass: $.fn.addClass,
	addClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ add: classNames }, speed, easing, callback ]) :
			this._addClass(classNames);
	},

	_removeClass: $.fn.removeClass,
	removeClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ remove: classNames }, speed, easing, callback ]) :
			this._removeClass(classNames);
	},

	_toggleClass: $.fn.toggleClass,
	toggleClass: function( classNames, force, speed, easing, callback ) {
		if ( typeof force === "boolean" || force === undefined ) {
			if ( !speed ) {
				// without speed parameter;
				return this._toggleClass( classNames, force );
			} else {
				return $.effects.animateClass.apply( this, [( force ? { add:classNames } : { remove:classNames }), speed, easing, callback ]);
			}
		} else {
			// without force parameter;
			return $.effects.animateClass.apply( this, [{ toggle: classNames }, force, speed, easing ]);
		}
	},

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.apply( this, [{
				add: add,
				remove: remove
			}, speed, easing, callback ]);
	}
});



/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

$.extend( $.effects, {
	version: "@VERSION",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.css( set[ i ], element.data( dataSpace + set[ i ] ) );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		};
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		};
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually loose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}


		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function(i, x){
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// short path for passing an effect options object:
	if ( $.isPlainObject( effect ) ) {
		return effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect)
	if ( options === undefined ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( $.type( options ) === "number" || $.fx.speeds[ options ]) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 : typeof speed === "number"
		? speed : speed in $.fx.speeds ? $.fx.speeds[ speed ] : $.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardSpeed( speed ) {
	// valid standard speeds
	if ( !speed || typeof speed === "number" || $.fx.speeds[ speed ] ) {
		return true;
	}

	// invalid strings - treat as "normal" speed
	if ( typeof speed === "string" && !$.effects.effect[ speed ] ) {
		// TODO: remove in 2.0 (#7115)
		if ( backCompat && $.effects[ speed ] ) {
			return false;
		}
		return true;
	}

	return false;
}

$.fn.extend({
	effect: function( effect, options, speed, callback ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ],

			// DEPRECATED: remove in 2.0 (#7115)
			oldEffectMethod = !effectMethod && backCompat && $.effects[ args.effect ];

		if ( $.fx.off || !( effectMethod || oldEffectMethod ) ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// if the element is hiddden and mode is hide,
			// or element is visible and mode is show
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		// TODO: remove this check in 2.0, effectMethod will always be true
		if ( effectMethod ) {
			return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
		} else {
			// DEPRECATED: remove in 2.0 (#7115)
			return oldEffectMethod.call(this, {
				options: args,
				duration: args.duration,
				callback: args.complete,
				mode: args.mode
			});
		}
	},

	_show: $.fn.show,
	show: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._show.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "show";
			return this.effect.call( this, args );
		}
	},

	_hide: $.fn.hide,
	hide: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._hide.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "hide";
			return this.effect.call( this, args );
		}
	},

	// jQuery core overloads toggle and creates _toggle
	__toggle: $.fn.toggle,
	toggle: function( speed ) {
		if ( standardSpeed( speed ) || typeof speed === "boolean" || $.isFunction( speed ) ) {
			return this.__toggle.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "toggle";
			return this.effect.call( this, args );
		}
	},

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 )
				val = [ parseFloat( style ), unit ];
		});
		return val;
	}
});



/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
$.easing.jswing = $.easing.swing;

$.extend( $.easing, {
	def: "easeOutQuad",
	swing: function ( x, t, b, c, d ) {
		return $.easing[ $.easing.def ]( x, t, b, c, d );
	},
	easeInQuad: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t + b;
	},
	easeOutQuad: function ( x, t, b, c, d ) {
		return -c * ( t /= d ) * ( t - 2 ) + b;
	},
	easeInOutQuad: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t + b;
		return -c / 2 * ( ( --t ) * ( t-2 ) - 1) + b;
	},
	easeInCubic: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t + b;
	},
	easeOutCubic: function ( x, t, b, c, d ) {
		return c * ( ( t = t / d - 1 ) * t * t + 1 ) + b;
	},
	easeInOutCubic: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t + b;
		return c / 2 * ( ( t -= 2 ) * t * t + 2) + b;
	},
	easeInQuart: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t * t + b;
	},
	easeOutQuart: function ( x, t, b, c, d ) {
		return -c * ( ( t = t / d - 1 ) * t * t * t - 1) + b;
	},
	easeInOutQuart: function ( x, t, b, c, d ) {
		if ( (t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t + b;
		return -c / 2 * ( ( t -= 2 ) * t * t * t - 2) + b;
	},
	easeInQuint: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t * t * t + b;
	},
	easeOutQuint: function ( x, t, b, c, d ) {
		return c * ( ( t = t / d - 1 ) * t * t * t * t + 1) + b;
	},
	easeInOutQuint: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t  * t * t * t + b;
		return c / 2 * ( ( t -= 2 ) * t * t * t * t + 2) + b;
	},
	easeInSine: function ( x, t, b, c, d ) {
		return -c * Math.cos( t / d * ( Math.PI / 2 ) ) + c + b;
	},
	easeOutSine: function ( x, t, b, c, d ) {
		return c * Math.sin( t / d * ( Math.PI /2 ) ) + b;
	},
	easeInOutSine: function ( x, t, b, c, d ) {
		return -c / 2 * ( Math.cos( Math.PI * t / d ) - 1 ) + b;
	},
	easeInExpo: function ( x, t, b, c, d ) {
		return ( t==0 ) ? b : c * Math.pow( 2, 10 * ( t / d - 1) ) + b;
	},
	easeOutExpo: function ( x, t, b, c, d ) {
		return ( t==d ) ? b + c : c * ( -Math.pow( 2, -10 * t / d) + 1) + b;
	},
	easeInOutExpo: function ( x, t, b, c, d ) {
		if ( t==0 ) return b;
		if ( t==d ) return b + c;
		if ( ( t /= d / 2) < 1) return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
		return c / 2 * ( -Math.pow( 2, -10 * --t ) + 2 ) + b;
	},
	easeInCirc: function ( x, t, b, c, d ) {
		return -c * ( Math.sqrt( 1 - ( t /= d ) * t ) - 1 ) + b;
	},
	easeOutCirc: function ( x, t, b, c, d ) {
		return c * Math.sqrt( 1 - ( t = t / d - 1 ) * t ) + b;
	},
	easeInOutCirc: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2) < 1 ) return -c / 2 * ( Math.sqrt( 1 - t * t ) - 1 ) + b;
		return c / 2 * ( Math.sqrt( 1 - ( t -= 2 ) * t ) + 1 ) + b;
	},
	easeInElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * 0.3,
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d ) == 1 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		return - ( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * d - s) * ( 2 * Math.PI ) / p ) ) + b;
	},
	easeOutElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * 0.3,
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d ) == 1 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		return a * Math.pow( 2, -10 * t ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) + c + b;
	},
	easeInOutElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * ( 0.3 * 1.5 ),
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d / 2 ) == 2 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		if ( t < 1 ) return -.5 * ( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) ) + b;
		return a * Math.pow( 2, -10 * ( t -= 1 ) ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) *.5 + c + b;
	},
	easeInBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		return c * ( t /= d ) * t * ( ( s+1 ) * t - s ) + b;
	},
	easeOutBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		return c * ( ( t = t / d - 1 ) * t * ( ( s + 1 ) * t + s) + 1) + b;
	},
	easeInOutBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * ( t * t * ( ( ( s *= 1.525 ) + 1 ) * t - s ) ) + b;
		return c / 2 * ( ( t -= 2 ) * t * ( ( ( s *= 1.525 ) + 1 ) * t + s) + 2) + b;
	},
	easeInBounce: function ( x, t, b, c, d ) {
		return c - $.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
	},
	easeOutBounce: function ( x, t, b, c, d ) {
		if ( ( t /= d ) < ( 1 / 2.75 ) ) {
			return c * ( 7.5625 * t * t ) + b;
		} else if ( t < ( 2 / 2.75 ) ) {
			return c * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + .75 ) + b;
		} else if ( t < ( 2.5 / 2.75 ) ) {
			return c * ( 7.5625 * ( t -= ( 2.25/ 2.75 ) ) * t + .9375 ) + b;
		} else {
			return c * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + .984375 ) + b;
		}
	},
	easeInOutBounce: function ( x, t, b, c, d ) {
		if ( t < d / 2 ) return $.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
		return $.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

})(jQuery);

/*
 * jQuery UI Effects Blind 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","bottom","left","right"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,
g);b.effects.removeWrapper(a);c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Bounce 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","bottom","left","right"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);
b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);
;

/********** Compass Rose **********
 www.compassro.se | www.brianmuenzenmeyer.com
 
The MIT License (MIT)
Copyright (c) 2011 Brian Muenzenmeyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
**********************************/

(function ($) {

  var delayUntilDone = function() {
    var timers = {};
    return function (callback, time, id) {
      if (!id){
        id = "defaultId";
      }
      if (timers[id]) {
        clearTimeout (timers[id]);
      }
      timers[id] = setTimeout(callback, time);
    };
  };

  $.compassRose = function (options, element) {
    this.element = $(element);
    this._init(options);
  };

  $.compassRose.settings = {
        radius: 200,
        arc: 360,
        center: true,
        point: {x:400, y:400},
        hoverFx: function(){jQuery.noop();},
        blurFx: function(){ jQuery.noop();},
        clickFx: function(){ jQuery.noop();},
        onRotateFx: function(){ jQuery.noop();},
        hoverClass: '',
        debugMode: false,
        orientOnStart: true,
        animateOrientation: true,
        centerElementId: undefined,
        centerElementLeftOffset: 0,
        centerElementTopOffset: 0,
        rotationMode: 'Ease', //or 'Turn'
        easingSpeed: 2000,
        sliceWidth: 4
  };

  $.compassRose.prototype = {
    
    _init : function (options) {
      this.settings = $.extend( true, {}, $.compassRose.settings, options);
      //add some data members
      this.settings.currentDirection = 0;
      
      //override point if center chosen
      if(this.settings.center){
        //note, block elements will break the width calculation
        //if compassRose is applied to a div, this will work
        //todo, check contextually
        this.settings.point.y = $(window).height() / 2;
        this.settings.point.x = $(window).width() / 2;
        
        if(this.settings.centerElementId !== undefined){
          var centerEle = $('#' + this.settings.centerElementId);
          $(centerEle).css('position', 'fixed');
          $(centerEle).css('left', this.settings.point.x - ($(centerEle).width() / 2) + this.settings.centerElementLeftOffset);
          $(centerEle).css('top', this.settings.point.y - ($(centerEle).height() / 2) + this.settings.centerElementTopOffset);
        }
        var root = $(this);
        
        $(window).resize(function(){
        delayUntilDone(function(){
          root[0].settings.point.y = $(window).height() / 2;
          root[0].settings.point.x = $(window).width() / 2;

          if(root[0].settings.centerElementId !== undefined){
            var centerEle = $('#' + root[0].settings.centerElementId);
            $(centerEle).css('position', 'fixed');
            $(centerEle).css('left', root[0].settings.point.x - ($(centerEle).width() / 2) + root[0].settings.centerElementLeftOffset);
            $(centerEle).css('top', root[0].settings.point.y - ($(centerEle).height() / 2) + root[0].settings.centerElementTopOffset);
          }
          
          root[0]._orient(true);
        }, 400, "resizeWindow");         
        });
      }
      
      if(this.settings.orientOnStart){
        this._calibrate();
        this._orient();
      }     
    },
    _calibrate: function () {
      this.settings.directions$ = this.element.children('div');
      //determine position of n directions within arc
      this.settings.arcSpan = this.settings.arc / this.settings.directions$.length;
      var rose = this;
      //add data to each passed in direction
      this.settings.directions$.each(function(n){       
        var ele = $(this),
            content = $(ele).html(),
            htmlString = '<span>' + content + '</span>';
        $(ele).data('compassRoseIndex', n);
        $(ele).data('compassRoseDirectionAngle', (n) * rose.settings.arcSpan);      
      
        //create the innerspan
        $(ele).empty().append(htmlString);
        $(ele).click(function(){
          rose.settings.clickFx(this);
        });
      
        $(ele).hover(
          function(){
            $(this).addClass(rose.settings.hoverClass);
            rose.settings.hoverFx(this);
          },
          function(){
            $(this).removeClass(rose.settings.hoverClass);
            rose.settings.blurFx(this);
          }
        );
      
      });    
    },
    _orient: function (performAnimation, performEasing) {
      if(performAnimation === undefined){
        performAnimation = false;
      }
      if(performEasing === undefined){
        performEasing = false;
      }
      var rose = this;
      
      this.settings.directions$.each(function(n){
        //calculate each direction's offset
        var ele = $(this),      
            radianAngle = $(ele).data('compassRoseDirectionAngle') * Math.PI / 180,
            xOffset = (Math.cos(radianAngle) * rose.settings.radius) + rose.settings.point.x - ($(ele).find('span').width() / 2),
            yOffset = (Math.sin(radianAngle) * rose.settings.radius * -1) + rose.settings.point.y;
        
        $(ele).data('compassRoseX', xOffset);
        $(ele).data('compassRoseY', yOffset);
        
        $(ele).css('position', 'fixed');
        if(performAnimation || rose.settings.animateOrientation){
          if(performEasing){
            $(ele).animate({left: xOffset,
                            top: yOffset}, rose.settings.easingSpeed, 'easeOutBounce');
          } else {
            $(ele).animate({left: xOffset,
                            top: yOffset}, 50);
          }
        } else{
            $(ele).css('left', xOffset);
            $(ele).css('top', yOffset);
        }
      });
    },
    addDirection: function (newElement) {
      $(this.element).append('<div>' + newElement + '</div>');
      this._calibrate();
      this._orient();
    },
    removeDirection: function (id) {      
      if(id !== undefined){
        var index = this._findIndex(id),
            ele;
        //if not found, return
        if(index === -1){
          return;
        }
        ele = $(this.settings.directions$).get(index);
        $(ele).remove();
      } else {
        this.element.children('div:last').remove();    
      }
      this._calibrate();
      this._orient();
    },
    rotate: function (degrees) {
      //check rotationmode, if 'ease', go right there with specified easing method
      if(this.settings.rotationMode === 'Ease' && degrees !== 0){
        this._rotate(degrees);
        this._orient(true, true);
      }
      else if(this.settings.rotationMode === 'Turn' && degrees !== 0){
        this._rotateBySlices(degrees);
        this._orient(true, false);
       }
      this.settings.onRotateFx();
    },
    _rotate: function (degrees) {
      this.settings.directions$.each(function(n){       
        var ele = $(this),
            currentAngle = parseInt($(ele).data('compassRoseDirectionAngle'), 10),
            newAngle = currentAngle + parseInt(degrees, 10);       
        if(newAngle >= 360){
          newAngle -= 360;
        }
        if(newAngle <= 0){
          newAngle = 360 + newAngle;
        }
        $(ele).data('compassRoseDirectionAngle', newAngle);          
      });
    },
    _rotateBySlices: function (degrees) {
      if(degrees === 0) { return; }  
      var absDegrees = Math.abs(degrees);
      if(absDegrees <= this.settings.sliceWidth){
        this._rotateSlice(degrees);
        this.rotate(0);
      } else if(degrees < 0) {
        this._rotateSlice(-this.settings.sliceWidth);
        this._rotateBySlices(degrees + this.settings.sliceWidth);
      }
      else{
        this._rotateSlice(this.settings.sliceWidth);
        this._rotateBySlices(degrees - this.settings.sliceWidth);
      }
    },      
    _rotateSlice: function (degrees) {
        this.settings.directions$.each(function(n){       
          var ele = $(this),
              currentAngle = parseInt($(ele).data('compassRoseDirectionAngle'), 10),
              newAngle = currentAngle + parseInt(degrees, 10);       
          if(newAngle >= 360){
            newAngle -= 360;
          }
          if(newAngle <= 0){
            newAngle = 360 + newAngle;
          }
          $(ele).data('compassRoseDirectionAngle', newAngle);          
        });
        this._orient(true, false);
    },
    rotateTo: function (id, angle) {
      //find element within settings.directions$
      var index = this._findIndex(id),
          ele,
          currentAngle,
          difference;
      //if not found, return
      if(index === -1){
        return;
      }
       
      ele = $(this.settings.directions$).get(index);
      currentAngle = $(ele).data('compassRoseDirectionAngle');
      //find difference
      difference = parseInt(angle, 10) - parseInt(currentAngle, 10);
      if (difference < -180){
      	difference = (360 + difference);
      }
      //rotate difference
      this.rotate(difference);
    },
    _findIndex: function (id) {
      var foundIndex = -1;
      $.each(this.settings.directions$, function(i, l){
        if($(l).attr("id") === id){
          foundIndex = i;
        }
      });
      return foundIndex;
    }
  };

  //
  // Create or return $.CompassRose constructor
  // Adapted from jQuery Isotope's architecture
  //   https://github.com/desandro/isotope/blob/master/jquery.isotope.js
  // "
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel 
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js
  // "
  $.fn.compassRose = function ( options ) {
    if ( typeof options === 'string' ) {
      // call method
      var args = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        var instance = $.data( this, 'compassRose' );
        if ( !instance ) {
          return $.error( "cannot call methods on compassRose prior to initialization; " +
            "attempted to call method '" + options + "'" );
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
          return $.error( "no such method '" + options + "' for compassRose instance" );
        }
        // apply method
        instance[ options ].apply( instance, args );
      });
    } else {
      this.each(function() {
        var instance = $.data( this, 'compassRose' );
        if ( instance ) {
          // apply options & init
          instance.option( options );
          instance._init();
        } else {
          // initialize new instance
          $.data( this, 'compassRose', new $.compassRose( options, this ) );
        }
      });
    }
    // return jQuery object
    // so plugin methods do not have to
    return this;
  };
 
})(jQuery);