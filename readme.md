CompassRose
========================

* A jQuery plugin created by Brian Muenzenmeyer
* Live demo @ www.compassro.se

### License
MIT - http://www.opensource.org/licenses/mit-license.php

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

````javascript
//with no arguments, centers compassRose on the window.
$('#nav').compassRose('center');
````
If a point object (see the options) is supplied, centers compassRose on its x and y coordinates


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
* radius - number or percent. Defines the radius of the compassRose relative to the page window. Uses smallest dimension (height or width) when determining radius by percent

* arc - number. Defines the portion of a circle to orient compassRose elements on. 360 is a complete circle.

* center - boolean. When true, centers compassRose on the browser window at initialization.

* radialOffset - number.  Causes compassRose to start orienting from a position relative to "North."

* centerElementId - string.  Defines the element to be centered within compassRose elements.

* centerElementLeftOffset - number.  Defines a relative offset on the x-axis of the center of compassRose.

* centerElementTopOffset - number.  Defines a relative offset on the y-axis of the center of compassRose.

* rotationEasing - string.  Name of easing function to be used during rotate and rotateTo calls. Supply your own for maximum flexibility.

* easingSpeed - number.  Milliseconds to perform easing function on radial animations.

* sliceWidth - number.  The number of degrees to move or step compassRose elements at a time when rotating without an easing function. The default is set to preserve the look of true rotational movement.

* hoverFx - function. Function to be called when user hovers over compassRose element.

* blurFx - function.  Function to be called when user leaves compassRose element.

* clickFx - function.  Function to be called when user clicks on CompassRose element.

* onRotateFx - function.  Function to be called after compassRose is finished rotating.