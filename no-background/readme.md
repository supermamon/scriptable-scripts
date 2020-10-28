## no-background.js

A module to create illusions of transparent backgrounds for Scriptable widgets.

### How to Use

*Setup*

Download both [no-background.js](no-background.js) & [No Background Config.js](No%20Background%20Config.js). Then run the `No Background Config` script. This should guide you on how to create the slices that can be used for your widgets.

*Your Widget*

There are different ways to get the wallpaper slice that you need to set for your widget background.

1. By getting the actual image for a specific position.

```javascript
const nobg = importModule('no-background.js')
const widget = new ListWidget();
widget.backgroundImage = await nobg.getSlice('small-top-left')
```

Valid slice names are:
- `small-top-left` / `small-top-right`
- `small-middle-left` / `small-middle-right`
- `small-bottom-left` / `small-bottom-right`
- `medium-top` /  `medium-middle` / `medium-bottom`, 
- `large-top` / `large-bottom`.

2. Getting the path of the image for a specific position. 

```javascript
const nobg = importModule('no-background.js')
const widget = new ListWidget();

const bgpath = nobg.getPathForSlice('small-top-left')
widget.backgroundImage = Image.fromFile(bgpath)
```

3. By storing the position for a widget and pulling that using a widgetID as a key. The key can be the name of the script or maybe pass the parameter when adding the widget on your home screen.

```javascript
const widgetID = "mywidget"
const nobg = importModule('no-background.js')

// store the widget position by calling this statement
// await nobg.chooseBackgroundSlice(widgetID)

const widget = new ListWidget();
widget.backgroundImage = await nobg.getSliceForWidget(widgetID)
```

I've created a template on how to actually use the third method where the background can be configured without changing the code.

* [Widget Template](no-bg-widget-template.js)

