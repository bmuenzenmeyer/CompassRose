(function($){

  $.compassRose = function(options, element){
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
        centerImageId: undefined,
        centerImageLeftOffset: 0,
        centerImageTopOffset: 0,
        rotationMode: 'Ease', //or 'Turn'
        easingSpeed: 2000,
        sliceWidth: 4
  };

  $.compassRose.prototype = {
    
    _init : function(options){
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
        
        if(this.settings.centerImageId !== undefined){
          var centerImg = $('#' + this.settings.centerImageId);
          $(centerImg).css('position', 'fixed');
          $(centerImg).css('z-index', -1);
          $(centerImg).css('left', this.settings.point.x - ($(centerImg).width() / 2) + this.settings.centerImageLeftOffset);
          $(centerImg).css('top', this.settings.point.y - ($(centerImg).height() / 2) + this.settings.centerImageTopOffset);
        }
        var root = $(this);
        
        $(window).resize(function(){
        delayUntilDone(function(){
          root[0].settings.point.y = $(window).height() / 2;
          root[0].settings.point.x = $(window).width() / 2;

          if(root[0].settings.centerImageId !== undefined){
            var centerImg = $('#' + root[0].settings.centerImageId);
            $(centerImg).css('position', 'fixed');
            $(centerImg).css('z-index', -1);
            $(centerImg).css('left', root[0].settings.point.x - ($(centerImg).width() / 2) + root[0].settings.centerImageLeftOffset);
            $(centerImg).css('top', root[0].settings.point.y - ($(centerImg).height() / 2) + root[0].settings.centerImageTopOffset);
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
    _calibrate: function(){
      this.settings.directions$ = this.element.children('div');
      //determine position of n directions within arc
      this.settings.arcSpan = this.settings.arc / this.settings.directions$.length;
      var rose = this;
      //add data to each passed in direction
      this.settings.directions$.each(function(n){       
        var ele = $(this);
        $(ele).data('compassRoseIndex', n);
        $(ele).data('compassRoseDirectionAngle', (n) * rose.settings.arcSpan);      
      
        //create the innerspan
        var content = $(ele).html();
        $(ele).empty();
        var htmlString = '<span>' + content + '</span>';
        $(ele).append(htmlString);
      
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
    _orient: function(performAnimation, performEasing){
      if(performAnimation == undefined){
        performAnimation = false;
      }
      if(performEasing == undefined){
        performiEasing = false;
      }
      var rose = this;
      
      this.settings.directions$.each(function(n){
        var ele = $(this);
        
        //calculate each direction's offset
        var radianAngle = $(ele).data('compassRoseDirectionAngle') * Math.PI / 180;
        var xOffset = (Math.cos(radianAngle) * rose.settings.radius) + rose.settings.point.x - ($(ele).find('span').width() / 2);
        var yOffset = (Math.sin(radianAngle) * rose.settings.radius * -1) + rose.settings.point.y;
        
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
    addDirection: function(newElement) {
      $(this.element).append('<div>' + newElement + '</div>');
      this._calibrate();
      this._orient();
    },
    removeDirection: function(id) {      
      if(id !== undefined){
        var index = this._findIndex(id);
        //if not found, return
        if(index == -1){
          return;
        }
        var ele = $(this.settings.directions$).get(index);
        $(ele).remove();
      } else {
        this.element.children('div:last').remove();    
      }
      this._calibrate();
      this._orient();
    },
    rotate: function(degrees){
      //check rotationmode, if 'ease', go right there with specified easing method
      if(this.settings.rotationMode === 'Ease' && degrees != 0){
        this._rotate(degrees);
        this._orient(true, true);
      }
      else if(this.settings.rotationMode === 'Turn' && degrees != 0){
        this._rotateBySlices(degrees);
        this._orient(true, false);
       }
      this.settings.onRotateFx();
    },
    _rotate: function(degrees){
      this.settings.directions$.each(function(n){       
        var ele = $(this);
        var currentAngle = parseInt($(ele).data('compassRoseDirectionAngle'));
        var newAngle = currentAngle + parseInt(degrees);       
        if(newAngle >= 360){
          newAngle -= 360;
        }
        if(newAngle <= 0){
          newAngle = 360 + newAngle;
        }
        $(ele).data('compassRoseDirectionAngle', newAngle);          
      });
    },
    _rotateBySlices: function(degrees){
      if(degrees == 0) { return; }  
      var absDegrees = Math.abs(degrees)
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
    _rotateSlice: function(degrees){
        this.settings.directions$.each(function(n){       
          var ele = $(this);
          var currentAngle = parseInt($(ele).data('compassRoseDirectionAngle'));
          var newAngle = currentAngle + parseInt(degrees);       
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
    rotateTo: function(id, angle){
      //find element within settings.directions$
      var index = this._findIndex(id);
      //if not found, return
      if(index == -1){
        return;
      }
       
      var ele = $(this.settings.directions$).get(index);
      var currentAngle = $(ele).data('compassRoseDirectionAngle');
      //find difference
      var difference = parseInt(angle) - parseInt(currentAngle);
        
      //rotate difference
      this.rotate(difference);
    },
    _findIndex: function(id){
      var foundIndex = -1;
      $.each(this.settings.directions$, function(i, l){
        if($(l).attr("id") == id){
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
  $.fn.compassRose = function( options ) {
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
  
  var delayUntilDone = (function(){
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
 
})(jQuery);