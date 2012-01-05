/********** Compass Rose **********
 www.compassro.se | www.brianmuenzenmeyer.com
 
The MIT License (MIT)
Copyright (c) 2011 Brian Muenzenmeyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
**********************************/

(function ($) {

  var delayUntilDone = (function() {
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
  })();

  $.compassRose = function (options, element) {
    this.element = $(element);
    this._init(options);
  };

  $.compassRose.settings = {
        radius: '90%',
        arc: 360,
        center: true,
        point: {x:600, y:600},
		radialOffset: 0,
        centerElementId: 'compassRoseContent',
        centerElementLeftOffset: 0,
        centerElementTopOffset: 0,
        rotationEasing: undefined,
        easingSpeed: 2000,
        sliceWidth: 4,
        hoverFx: function(){jQuery.noop();},
        blurFx: function(){ jQuery.noop();},
        clickFx: function(){ jQuery.noop();},
        onRotateFx: function(){ jQuery.noop();}
  };

  $.compassRose.prototype = {
	_center: function(){
      var element = $('#' + this.settings.centerElementId);
      $(element).css('position', 'fixed');
      $(element).css('left', this.settings.point.x - ($(element).width() / 2) + this.settings.centerElementLeftOffset);
      $(element).css('top', this.settings.point.y - ($(element).height() / 2) + this.settings.centerElementTopOffset);	
	},
	//centers CompassRose on given point or the window
    center: function(suppliedPoint){
	  if (suppliedPoint){
		this.settings.center = false;
		this.settings.point = suppliedPoint;
	  } else {
		this.settings.center = true;
		this.settings.point.y = $(window).height() / 2;
		this.settings.point.x = $(window).width() / 2;
      }
	  this._center(); 
    },
    _init : function (options) {
      this.settings = $.extend( true, {}, $.compassRose.settings, options);
      //override point if center chosen
      if(this.settings.center){
        if(this.settings.centerElementId !== undefined){
          this.center();
        }
        var root = $(this);        
        $(window).resize(function(){
          delayUntilDone(function(){
            if(root[0].settings.centerElementId !== undefined){
              root[0].center();
            }
            root[0]._orient(true);
          }, 400, "resizeWindow");         
        });
      } else {
		this._center();
	  }
      this._calibrate();
      this._orient();
    },
    _calibrate: function () {
      this.settings.directions$ = this.element.children('div');
      //determine position of n directions within arc
      this.settings.arcSpan = this.settings.arc / this.settings.directions$.length;
      
      if(typeof(this.settings.radius) === 'string'){
        if(this.settings.radius.indexOf('%') !== -1){
        var percentString = this.settings.radius.replace('%', ''),
            percent = parseInt(percentString, 10),     
            //determine the minimum window percentage
            windowWidth = $(window).width(),
            windowHeight = $(window).height();
            this.settings.radius = windowWidth > windowHeight ? ((windowHeight * (percent / 100))/2) : ((windowWidth * (percent / 100))/2);        
        }
      }
      
      var rose = this;
      //add data to each passed in direction
      this.settings.directions$.each(function(n){       
        var ele = $(this),
            content = $(ele).html(),
            htmlString = '<span>' + content + '</span>';
        $(ele).data('compassRoseDirectionAngle', (n * rose.settings.arcSpan) + 90 + rose.settings.radialOffset); //90 to start at north, offset to allow user to go from there      
      
        //create the innerspan
        $(ele).empty().append(htmlString);
        $(ele).click(function(){
          rose.settings.clickFx(this);
        });
      
        $(ele).hover(
          function(){
            rose.settings.hoverFx(this);
          },
          function(){
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
        if(performAnimation){
          if(performEasing){
            $(ele).animate({left: xOffset,
                            top: yOffset}, rose.settings.easingSpeed, rose.settings.rotationEasing);
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
	//rotate CompassRose by the given amount of degrees
    rotate: function (degrees) {
      //if a custom Easing function is applied, use it during orientation and do not rotate in slices
      if(this.settings.rotationEasing !== undefined && degrees !== 0){
        this._rotate(degrees);
        this._orient(true, true);
      }
      else if(degrees !== 0){
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
	//rotate the given CompassRose id to the given angle
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

  // Create or return $.CompassRose constructor
  // Adapted from jQuery Isotope's architecture
  //   https://github.com/desandro/isotope/blob/master/jquery.isotope.js
  // "A bit from jQuery UI
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