# Peanuts™ Widget
---

![](img/peanuts-widget-crop.png)

A widget to show current/random Peanuts™ comic.

[Source](../source/peanuts-widget.js) | [Import](https://open.scriptable.app/run/Import-Script?url=https://github.com/supermamon/scriptable-scripts/source/peanuts-widget.js)

---

## Options

| Option                 | Default | Description                                                                                                                   |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `BACKGROUND_DARK_MODE` | system  | Set to light or dark mode. Either set to `yes`, `no` or `system` to follow the system setting                                 |
| `TRANSPARENT`          | false   | Set to `true` simulate transparent background using [no-barckground](https://github.com/supermamon/scriptable-no-background). |
| `RANDOM`               | false   | Set to `true` to show random comic instead of today's one.                                                                    |
| `SHOW_TITLE`           | true    | Show the "Peanuts" title on top                                                                                               |
| `SHOW_DATE`            | true    | Show the publication date of the comic                                                                                        | 

`BACKGROUND_DARK_MODE` is ignored if `TRANSPARENT` is `true`.

The `RANDOM` option can also be overriden by setting the widget parameter to `random`.
