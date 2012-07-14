CompassRose
========================

* A jQuery plugin created by Brian Muenzenmeyer
* Live demo @ www.compassro.se

### License
MIT
* http://www.opensource.org/licenses/mit-license.php

### Quick Start
````javascript
$('#nav').compassRose();
````
CompassRose takes a list of divs and orients them using unit circle math.  

### Methods
````javascript
//rotate all elements by 45 degrees
$('#nav').compassRose('rotate', 45);
````
Rotate accepts positive or negative numbers.  Numbers greater than 360 degrees can be used for multiple rotations.

````javascript
//rotates given element to given degree
$('#nav').compassRose('rotateTo', 'id', 90);
````
Zero(0) is "East"

### Options
````javascript
//defaults  
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

````
* radius - number or percent. Defines the radius of the CompassRose relative to the page window. Uses smallest dimension (height or width) when determining radius by percent

* arc - number. Defines the portion of a circle to orient CompassRose elements on. 360 is a complete circle.