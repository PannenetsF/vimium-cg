If a user wants to keep Vimium C's commands usable even when an input box is focused, here's some advices:

### Trigger commands of Vimium C

#### `Escape` and `Ctrl+[`

<a name="escape"></a><a name="blur"></a>
  press <kbd>Esc</kbd> or <kbd>Ctrl+[</kbd> to "blur" input boxes and then Vimium C will go back to normal mode and consume following keys
  * `<esc>` and `<c-[>` can be mapped. For example, `mapkey <c-]> <esc>` will make <kbd>Ctrl+]</kbd> (during Vimium C consumes it) work like <kbd>Esc</kbd>
  * there's a command named `switchFocus`, and you may use it to re-focus the most-recently-focused input box, when you have pressed <kbd>Esc</kbd>

#### `F1` to `F12`

<a name="function-keys"></a>
  map some keys which contains <kbd>F1</kbd> ~ <kbd>F12</kbd>
  * Vimium C will keep such keys, whose main key is F1~F12, usable even in a default insert mode
    * of course not in the insert mode entered by the command `enterInsertMode`
  * For example, `map <s-f8> LinkHints.activate` makes <kbd>Shift+F8</kbd> always trigger LinkHints mode
  * But `map <f8>f LinkHints.activate` can not be triggered in a default insert mode, because the second key, `f`, is not in F1~F12
    * if press `<f8>` and then `f`, then `<f8>` will be consumed by Vimium C, and `f` will be passed through to a input box itself.

#### Global shortcuts

<a name="shortcut"></a><a name="shortcuts"></a><a name="global-shortcuts"></a>
  configure global shortcuts on `chrome://extensions/shortcuts` or `about:addons` (Firefox)
  * command shortcuts configured here are always usable, unless some of browser's built-in shortcuts have higher priorities.
  * if the command you want is not in the list, you may setup "User Customized" 1 and 2, and add something like `shortcut userCustomized1 command="goBack"` into "Custom key mappings" on Vimium C Options page
  * if the 2 placeholders are not enough, there's an assistant extension named [Shortcut Forwarding Tool](https://chrome.google.com/webstore/detail/shortcut-forwarding-tool/clnalilglegcjmlgenoppklmfppddien) to let you setup more.
  * on Firefox, please visit `about:addons` manually, click the `settings` icon button and click `Manage Extension Shortcuts`

#### `mapKey` in `InsertMode`
* <a name="insert-mode"></a><a name="mapkey"></a>
  long keys ending with `:i` also work in a plain insert mode, since v1.84.1
  * for example, `map <c-j:i> editText run="auto,forward,line"` will move caret down by a line, only in insert mode
  * but they do not work in any global insert mode of `enterInsertMode`
* <a name="v-prefix"></a>
  long keys starting with `v-` always work in a plain insert mode, since v1.92.0

### Trigger more than one commands

<a name="passNextKey"></a>***Note:** this section only works since v1.97.0*.

The `passNextKey` support a parameter named `normal`, just as in Vimium, and since v1.97.0 it can skip the check of insert mode**, so you may add a mapping like this:
```
map <f1> passNextKey normal count=10
```

And then, if press `<f1>` in input, you can trigger all key mappings, whether it's allowed in insert mode or not, for up to 10 times. If you want to exit this, an `<esc>` is just enough.

### Edit text using `editText`

The `editText` command support `run="<text-command> [... "," [spaces] <text-command>]"`:
* a `<text-command>` must include 1-3 units; if it is not the last text command, it must include 3 units
  * in a text command, this order of units is `cmd, arg1, arg2`
  * when `arg2` is omitted, it means an empty string
* when `cmd` is `exec`, `arg1` and `arg2` are passed to `document.execCommand(arg1, false, arg2)`
* when `cmd` is `replace`, replace currently selected text with `arg1`
  * `arg1` can be URL-encoded, and it will be decoded before inserting into an input box
  * `arg1` can include `"$s"` (or `%s`) which refers the currently selected text
* when `cmd` is `collapse`, make a current selection collapse
  * if `arg1` is `end`, then collapse into the end; otherwise collapse into the start
* when `cmd` is `auto`, `extend` or `move`, then modify a current selection
  * if `cmd` is `auto`, it means `extend` when a selection has a range, or otherwise `move`
  * `arg1` can be `forward`, `backward` or `count` (if `command count > 0` then `forward`; otherwise `backward`)
  * `arg2` should be a valid granularity like `character`, `word`, `sentence`, `line` or `lineboundary`
    * a full list is in https://developer.mozilla.org/en-US/docs/Web/API/Selection/modify#granularity

Here're some examples:
```
# make selected text italic (e.g. in a MarkDown document)
map <c-b:i> editText run="replace,_$s_"
# delete a word starting from a current cursor, just like in Bash shell
map <a-f:i> editText run="extend,forward,word,exec,delete"
```

`editText` also supports a boolean `dom`. By default it only executes its `run` when an editable input / textarea is focused,
but when `dom` is true, it also executes on common content-editable elements.

More examples can be seen in https://github.com/gdh1995/vimium-c/issues/114#issuecomment-581125416 (in English)
  and https://github.com/gdh1995/vimium-c/issues/386#issuecomment-876404555 (in Chinese).

### On `<esc>` not blur but trigger a page's `Escape`

<a name="trigger-esc"></a>Here's an example to simulate a pair of `Escape` keyboard events to trigger actions of a page itself and other extensions:
```
mapKey <c-]> <v-esc_pair>
# v1.96.* has a bug, so `keys` need to be `"+esc+-esc"`, since v1.97 `keys="esc-esc"` should work
map <v-esc_pair> runKey keys="+esc+-esc"
map <v-esc> dispatchEvent type="keydown" code="Escape" key="Escape" keyCode=27
```

This method requires the command `dispatchEvent`, which is available since v1.92.4 .

### On `<esc>`, not only blur but also trigger a page's `Escape`

<a name="pass-esc"></a>Since v1.96.0, Vimium C has supported `Compatibility of Escape`, and you may specify a list of CSS selectors to make Vimium C pass <kbd>Escape</kbd> keys to pages when it blurs a target input element.