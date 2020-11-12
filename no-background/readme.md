# no-background.js

A module to create illusions of transparent backgrounds for Scriptable widgets.

**Features**
* Interactive Configuration
* Dark and Light mode support
* Methods to get the actual background image or the image path
* Store widget positions
* Option for semi-transparent style

--- 

## The 3-Step Setup

1. Download both [no-background.js](no-background.js)
2. Add the following code in your widget code

    ```javascript
    const nobg = importModule('no-background.js')
    const widget = new ListWidget()
    widget.backgroundImage = await  nobg.getSliceForWidget(Script.name())

    // the rest of your widget code 
    ```
3. Run your widget!

--- 

## More Options

### Update the background after you moved your widget's position

The `getSliceForWidget` method has an optional second boolean argument to prompt for a new widget position. This is useful when you changed the position of the widget on your home screen. 

```javascript
const RESET_POSITION = true

const nobg = importModule('no-background,js')
const widget = new ListWidget()
widget.backgroundImage = await nobg.getSliceForWidget(Script.name(), RESET_POSITION)

// the rest of your widget code 
```

*Tip: Change `const RESET_POSITION = true` to `const RESET_POSITION = !config.runsInWidget` to automatcally prompt for a new position every time you run the script inside the app*


### Changing Your Wallpaper
  
Now, you may want update the backgrounds after you change your wallpaper. For that, you can download the companion utility script [No Background Config.js](No%20Background%20Config.js).

Download the script and run it.

This script has 2 options, `Generate Slices` and `Clear Widget Positions Cache`.
Use the `Generate Slices` option to update backgrounds from your current wallpaper.
`Clear Widget Positions Cache` will delete all saved positions from all widgets.
You'll have to run each individual widget to setup their positions.


### Static Location

If you have widgets that you are most likely not to move around, you can specify a its position using the `getSlice` method.

```javascript
const nobg = importModule('no-background.js')
const widget = new ListWidget();
widget.backgroundImage = await nobg.getSlice('medium-top')

// the rest of your widget code 
```

Valid slice names are:

- `small-top-left` / `small-top-right`
- `small-middle-left` / `small-middle-right`
- `small-bottom-left` / `small-bottom-right`
- `medium-top` /  `medium-middle` / `medium-bottom`
- `large-top` / `large-bottom`


### Getting the path instead of the actual image

Sometimes you may want to get the actual path of the image for a specific posistion. 

```javascript
const nobg = importModule('no-background.js')
const widget = new ListWidget();

const bgpath = nobg.getPathForSlice('small-top-left')
widget.backgroundImage = Image.fromFile(bgpath)

// the rest of your widget code 
```

*Like the `getSliceForWidget` method, both the `getSlice` and `getPathForSlice` also prompt for setup if the slices don't exist.*

## Examples

* [nobg-small-top-left-widget.js](examples/nobg-small-top-left-widget.js) - a very basic example for a widget on a fixed position
* [nobg-configurable-widget-template.js](examples/nobg-configurable-widget-template.js) - example widget where the possition can be set at run-time
* [weather-widget-414.js](examples/weather-widget-414.js) - weather example based off the [code by @eqsOne](https://talk.automators.fm/t/widget-examples/7994/414)
* [semi-transparent-widget.js](semi-transparent-widget.js) - example widget with a semi-transparent background

## Preview

![](preview-lrg.png)