# keyFrames To OnScroll

This script turns your keyframe animations into scroll-based animations **(see below for supported animations).** 

Made this because the new [animation-timeline:scroll](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) CSS property is not supported on all browsers yet (-> [Check out this video for a great explanation](https://www.youtube.com/watch?v=UmzFk68Bwdk&ab_channel=KevinPowell)). 

This is the **'we have animation-timeline:scroll; at home'** version, it's not as good, but it's something if you want full browser support 💁‍♀️

##### How to:

Simply add the script to your website, and it will go through all the rules in your **first stylesheet** and read out the animation names, then turn them into scroll-based ones. (Does not work for inline CSS animations). If you want to include more stylesheets, refer to script line ...

 If you want to exclude an animation, include 'exclude' in the animation name and keyframe names (Case sensitive)

##### Workings:

In your keyframe style rules:

* 0% (or 'from') means div is at the bottom of the screen
* 100% (or 'to') means div is at the top of the screen

Interprolates styles in between your defined keyframe percentages when scrolling between them.

If your first animation frame is above 0%/last is below 100%, element will take the first animation value initially and/or the last one untill leaving the screen.

#### Currently works for:

* **Simple css properties** that have a (value)(unit) notation, like width:3px, height: 3vh; or e.g. left, right, margins, paddings, opacity etc. **Needs to have the same units in all frames.**
* **simple transformations** with value/unit notation (it will split the transformation into parts if needed) like transformX(20px)rotateY(30deg), but not skew(30deg, 20deg)
* **simple filters and backdrop filters** that use (value)(unit) notations, like blur(2px), but not drop-shadow or url-based filters. Will split into prats like transformations
* **background-color, background, color, border-color** (uses HSL based color-mix function) for background, this only works with a color. Can use rgb, hsl, color names, whichever you prefer.

**Not working yet:** Complex CSS properties like clip-path, box-shadow, background-images or anything not mentioned above


### Extra info

It will set the animation-duration of targeted elements to 0s, iteration count to 1, fill-mode to none and direction to normal to disable the keyframe animations. 

I made this script thinking of someone scrolling down the document, and scrolling up is a little less accurate (would need to change some formulas)

Also adds a transition of 0.5s to prevent glitches.
