Since v1.88.0, Vimium-C supports a much more powerful `runKey` command and a special directive of `env`, and then users may trigger different commands with a same key, on different websites or for different active elements in current page.

* `env` is to declare a group of conditions (as an "environment"), and its syntax is `env <name> condition1="..." condition2="..."`
  * `name` can be any string if only it has no white space characters
  * since v1.88.2, there're **3 supported conditions**: `host`, `element` and `fullscreen`
  * the usage of `host` condition is just like URL patterns of exclusion rules, while when it's a RegExp, it must start with `^`
    * since v1.92.0, `iframe: boolean | string` is used to match iframes, while `host` only uses top frame URLs
    * before v1.92.0, `host` use URLs of current frames with one exception:
      for `about:blank` or similar iframes, use a URL of the whole tab instead (so do exclusion patterns)
  * the value of `element` can be a join of tagName, className and ID, following the syntax of CSS selectors
  * `fullscreen` can be a boolean value, and it only checks fullscreen status caused by JavaScript code, but not status from browser's shortcuts like <kbd>F11</kbd>
* then `runKey` mainly has two options: `expect` and `keys`
  * `expect` can be a dict mapping environment names to keys, an array of `{"env":"...","keys":"...","options"?:{...}}`,
    or a string of `envName1: keySequences1; env2: keys2` (before v1.92.0, replace `;` with `,`)
  * since v1.92, `expect` can also be a list of triplets including `env`, `keys` and optional `options`
  * if an environment matches a current situations, then use its corresponding `keys` and the count received by `runKeys` to trigger another `map` rule
  * if no environments match, then trigger the `keys` and `options` parameters of `runKey` itself
* `keys` should be a valid "key sequence" like `f`, `gF`, `[[`, `<a-c>` and `<v-j:i>`, or it can be a list of key sequences
  * if a `keys` is only a string and has no space characters, then Vimium C will execute a new key sequence of `repeating count of "runKey" + keys`
  * if there're spaces in a `keys` string, or `keys` is an array of string, then use repeating count of `runKey` to select an item of it
    * if the absolute value of repeating count is too large, then show an error and stop
    * if the repeating count is negative, then do finding backwards
  * since v1.92.0, the delimiter of keys can also be `,`
* `keys` can also be [a tree of key sequences, supporting `if-then-else` structures](./Auto-run-a-tree-of-commands)
* if `runKey` has no `options`, then all parameters whose names match ``` `o.${string}` ``` will be collected as its `options` parameter

Here's an example of mappings, which is used to move caret on `input`, `<textarea>` or `<select>` smartly (meaing of `<c-j:i>` can be found in [./Use-in-another-keyboard-layout](./Use-in-another-keyboard-layout)):
```
# some syntax work since v1.92.0

env input element="input"
env select element="select"
# env textarea element="textarea"

map <c-j:i> runKey expect={"input":"<v-j1>","select":{"keys":"<v-j2>",options:{}}} keys="<v-j0>"
map <c-k:i> runKey expect=[{"env":"input","keys":"<v-k1>"},{"env":"select","keys":"<v-k2>",options:{}}] keys="<v-k0>"
# map <c-h:i> runKey expect="input:<v-h1>;select:<v-h2>,<v-h2_2>" keys="<v-k0>"
map <v-j0> editText run="auto,forward,line"
map <v-k0> editText run="auto,backward,line"
map <v-j1> editText run="auto,forward,character"
map <v-k1> editText run="auto,backward,character"
map <v-j2> scrollSelect
map <v-k2> scrollSelect dir=-1
```

Note: `<v-***>` is also a new syntax since v1.88.0. It focuses on declaring a "fake" composed key to use in `mapkey` and `runKey`, and can improve the performance of looking up keys slightly.

Another example showing the `runKey` command combined with the `match` option for link hints on a specific website:

```
env hn host="https://news.ycombinator.com/"

map F runKey expect={"hn":"<v-fhn>"} keys="<v-fd>"
map <v-fd> LinkHints.activateModeToOpenInNewTab
map <v-fhn> LinkHints.activateModeToOpenInNewTab match=".titlelink"

env cBm host=":chrome://bookmarks/"

map f runKey expect=[["cBm","<v-f>",{"clickable":"[role=treeitem]"}]] keys="<v-f>"
map <v-f> LinkHints.activate
```

This highlights only the actual external links on the Hacker News frontpage that can be opened in a new tab. You could do the same for `f`, however, if you leave that as it is, you can still use it to highlight the links to comment pages (and perhaps toggle to open them in a new tab using `Ctrl` in highlight mode).
