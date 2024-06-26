# keyframes To OnScroll

This script turns your keyframe animations into scroll-based animations (see below for **supported animations** + info on accessibility)

![1718721452014](image/README/1718721452014.gif)

Codepen: [keyframesToOnScroll (codepen.io)](https://codepen.io/aleids/pen/RwmQRpG)

Example website: [Aleidsuzan.com/animations](https://www.aleidsuzan.com/animations)

ℹ This was made as an alternative to [animation-timeline:scroll](https://www.youtube.com/watch?v=UmzFk68Bwdk&ab_channel=KevinPowell) which is not supported on all browsers yet. This script is not as extensive but should work on most browsers (check to confirm).

#### How to:

Simply download the script.js file and add it to your website, or use link below;

```
<script src="https://cdn.jsdelivr.net/gh/AleidS/keyFramesToOnScroll@v1.0.0-beta/dist/V1/script.js"></script>
```

**Add Jquery;**

```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
```

It will go through alll the rules in your stylesheets, read out the animations, and turn them into scroll-based ones.

**In your keyframe style rules:**

* **0%** (or 'from') means div is at the **bottom of the screen**
* **100%** (or 'to') means div is at the **top of the screen**:

![1718723862405](image/README/1718723862405.png)

- Interprolates styles in between keyframes based on scroll position
- If you want your animation to end at e.g. halfway the screen, use 50% as your last keyframe value.
- Elements will take on first animation frame when entering the screen, and retain the last one untill exiting.
- Does **not consider inline CSS animations**
- **Number of stylesheets:** If you only want to include the first stylesheet, refer to line 27- 46 and comment out this block of code.
- If you want to **exclude an animation**, include 'exclude' in the animation name and it will ignore this animation.

#### Currently works for:

* **Simple css properties** that have a (value)(unit) notation, like width:3px, height: 3vh; or e.g. left, right, margins, paddings, opacity etc. **Needs to have the same units in all frames.**
* **simple transformations** with value/unit notation (it will split the transformation into parts if needed) like transformX(20px)rotateY(30deg), but not skew(30deg, 20deg)
* **simple filters and backdrop filters** that use (value)(unit) notations, like blur(2px), but not drop-shadow or url-based filters. Will split into prats like transformations
* **background-color, background, color, border-color** (uses HSL based color-mix function) for background, this only works with a color. Can use rgb, hsl, color names, whichever you prefer.
* Most clip-paths
* most box-shadows

#### Not working yet:

* Complex CSS properties like background-images, grid layouts, or anything not mentioned above

If an element has 2 animations (e.g. one for DIV and one for .Classname) it will run both of them, and might cause clashes.

#### Accesibility

If user has 'reduced motion' enabled, the script should not execute (test to confirm). However, **default animations might still show.**

To prevent keyframe animations from showing in this case, add the below code to your stylesheets;

```
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition-duration: 0s !important;
    }
}
```

To emulate reduced-motion settings in edge/chrome, use inspector->command->reduce

![1718729225929](image/README/1718729225929.png)

### Technical info

- Script will set the animation-duration of targeted elements to 0s, iteration count to 1, fill-mode to none and direction to normal to disable the default keyframe animations. Also adds a transition of 0.5s to prevent glitches.
- Works best when scrolling down the document, because it looks at next largest keyframe. Scrolling in reverse direction is a bit laggy.

#### Contribute?

- Script does not support background image animations or grid animations yet, can be added to the if/else block at 260-478
- Add reverse-scroll support
