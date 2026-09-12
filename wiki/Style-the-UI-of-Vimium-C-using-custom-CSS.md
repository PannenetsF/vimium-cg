On Vimium C Options page, you can write your own rules in the box with the label `Custom CSS for Vimium C UI`. Here are some tips to help you get started.

## Basic structure

Make sure you have the following structure by placing CSS comments depending on what type of elements you want to style:

```
/* #ui */
[ Rules for the HUD and Hints go here. ]

/* #omni */
[ Rules for the Vomnibar go here. ]

/* #find */
[ Rules for the FindBar (inside the iframe) go here. ]

/* #find:host */
[ Rules _for web pages while only enabled when there's a FindMode_ go here. ]

/* #find:selection */
[ When Vimium C executes find and there's at least one match, this can be used to change styles of the selection area ]
```

## Finding element classes and ids

Use your browser's "Inspect Element" feature (this can be accessed by pressing <kbd>Ctrl+Shift+C</kbd> in Firefox or Chromium/Chrome) on the element you want to style.

As an alternative, you can use the selectors written in [vomnibar.html](https://github.com/gdh1995/vimium-c/blob/master/front/vomnibar.html) for styling the Vomnibar.

Some elements of the Vimium C UI (like the HUD) are not picked up by the Inspect Element tool. To find the correct selectors for these, take a look at [vimium-c.css](https://github.com/gdh1995/vimium-c/blob/master/front/vimium-c.css).

## Using your styles with dark mode

If you'd like to have a customized dark theme, you can use your styles *on top of* Vimium C's built-in dark mode. The advantage of this is that you don't have to write a rule for every element, only the ones you want to look different from the default rules.

To do this, check the option "Auto switch between light and dark mode", or, if you don't have a dark theme enabled in your system settings, include `"styles": "dark"` in "Vomnibar settings" in the Options page. (The latter only affects the Vomnibar.)

In addition, you may need to select the class `D` for some elements (note: not those Vomnibar iframe's) when dark mode is active. For example, this is how you would style the HUD if you want its colour to be black:

```
/* #ui */
.HUD.D:after { background: black; }
/* #omni */
#bar { background: #333; }
```

## Work with #enable-force-dark

If you have activated `Force Dark Mode for Web Contents` in `chrome://flags`, the color of hint characters will be forced to be `white`, but its background won't. This will make hint markers very hard to read.

Since Chrome 88, you may try adding the below code to `Custom CSS for Vimium C UI` on Vimium C Options:
``` css
.LH, .D>.LH { background: linear-gradient(hsl(56deg 100% 30%),hsl(42deg 100% 25%)); color: #f1f1f1; }
```

and add `dark` to `styles` in `Vomnibar settings`, so that it looks like `"style": "mono-url dark"`.

Before the Chromium version, I haven't found a way to change the white color, while fortunately there's a working-around: change the background color instead. And you may try:
``` css
.LH, .D>.LH { background: green; }
.LH { border: /*!DPI*/ 1px solid lightgreen; }
/* #omni */
.s { background-color: #d8e3f3; }
```

This idea is from Koolstr ([#111 (comment)](https://github.com/gdh1995/vimium-c/issues/111#issuecomment-583569154)).

## Vomnibar size

When you change width or height of Vomnibar elements, like `#bar` or `.item`, you also need to update the `sizes` field of `Vomnibar settings` on Vimium C Options.

`Vomnibar settings: sizes` includes 4 numbers:
* height when no suggestion items (including box shadow)
* extra height when there're some suggestions (exclude items themselves)
* basic height of a normal suggestion item
* width of Vomnibar panel (percentage of window width), which only exists since v1.92.4

For example, if there're `N` suggestion items, then Vomnibar's final height is "`sizes[0] + sizes[1] + sizes[2] * N` if `N > 0` else `sizes[0]`".


