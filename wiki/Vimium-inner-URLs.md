"vimium://***" URLs is a collection of tricks to do some complex jobs with a line of text, like:

* `vimium://math 1+2` to compute "`1+2`"
* `vimium://copy abcd...` to copy "`abcd...`" into the system clipboard
* `vimium://parse new-keyword full-URL` to use custom search engine rules to smartly parse what you're searching and re-search with a new engine.
* `vimium://status toggle` to toggle Vimium C's working status on the current tab

Some inner URLs will be translated into a new URL, and some others can make Vimium C execute special functions.

## Page URLs

* `newtab`: open the "New tab URL" on Vimium C Options page
* `options`,`settings`, `profile` since v1.93.2: open Vimium C Options page
* `blank`: open a safe blank webpage which supports Vimium C
* `show`: open a special Vimium C page to display images and text
  * it use https://github.com/fengyuanchen/viewerjs to support zooming and rotation
* `about`,`help`,`license`,`permissions`,`policy`,`privacy`,`readme`,`wiki`:
  * point to some pages of `https://github.com/gdh1995/vimium-c`
  * e.g. `vimium://wiki` returns `https://github.com/gdh1995/vimium-c#readme`

## Function URLs

* `math`,`e`,`exec`,`eval`,`expr`,`calc`,`m`: compute a mathematical expression
  * `sum`: compute summation of a list of numbers
  * `mul`: compute product of a list of numbers
  * `avg`,`average`: compute average of a list of numbers
  * e.g. `vimium://math 2 * sin(PI / 4)` returns "`1.414213562373095`"
  * e.g. `vimium://sum 1 2 3 4` returns "`10`"
* `copy`,`cp`: copy some text into the system clipboard
  * e.g. `vimium://copy text-to-copy` copies "`text-to-copy`"
* `copy-url`,`search-copy`,`search.copy`,`url-copy`:
  * convert text into a complete URL, "execute" it (if possible) and then copy
  * e.g. `vimium://copy-url 3` copies "`https://www.baidu.com/s?ie=utf-8&wd=3`"
  * e.g. `vimium://copy-url vimium://math 2 * sin(PI / 4)` copies "`1.414213562373095`"
* `url`,`u`,`search`: convert text (with / without a keyword) into a complete URL
  * `vimium://url g vimium c` returns "`https://www.google.com.hk/search?ie=utf-8&q=vimium+c`"
  * `vimium://url hello` returns "`https://www.baidu.com/s?ie=utf-8&wd=hello`" (if baidu is the default search engine)
* `urls` (since v1.95): convert query words into several URLs and then open them
  * the syntax is `vimium://urls/b|g|w:query words`, and `|` can be replaced with the space character (U+0020)
  * query words should be appended "as is" after `:`
  * when `|` is used to split keywords, `:` can be replaced with the space character
* `parse`,`decode`:
  * smartly parse what you're searching and re-search with a new search engine
* `paste`:
  * (since v1.80.0) access text from your system clipboard and convert to a URL
  * (since v1.80.1) `paste` can be followed by a list of `sed` rules, and their delimeter is the `Space` character
* `cd` (since v1.80.1):
  * construct URLs just like `cd` in terminal. Usage: `vimium://cd <jump-level> [new-sub-path [any-URL]]`
  * E.g. `vimium://cd ... vimium-c/pulls https://github.com/gdh1995/vimium/issues` will be converted to `https://github.com/gdh1995/vimium-c/pulls`
  * `vimium://cd /.. pulls https://github.com/gdh1995/vimium/issues` will also be converted to `https://github.com/gdh1995/vimium-c/pulls`
* `status`,`state`: change Vimium C's working status on the current tab
  * have 4 sub-commands: `toggle`, `disable`, `enable` and `reset`
  * e.g. `vimium://status enable` enables Vimium C and ignores any exclusion rules
  * see [How to disable and re-enable it using a same hotkey][Enable-or-Disable-all-frames-by-a-shortcut] for details
* `run` (since v1.93): followed by a command tree, which is just like an item in `runKey`'s `keys`, and Vimium C will execute it
  * you may write a very long command tree, with complex parameters, and save it in your bookmark manager (let's name it `v:cmd1`)
  * then `map xxx openBookmark title="v:cmd1"` will run the given tree, so `Custom key mappings` can keep short

## vimium://parse

For "vimium://parse", Vimium C uses all "parsing-regexp" items to try to detect query words in the <full-URL> part, and the <full-URL> is all the text after <new-keyword>.

If an regexp matches successfully, Vimium C redo a search for query words - it creates a new URL using the search engine of <new-keyword>.

Here's a trick about key mappings:
```
map <f7> openUrl url="vimium://parse\u0020g\u0020$url" url_mask="$url" reuse=-2
```

Explainations:
* "`openUrl`" is the command name
* "`url=`" means the wanted URL
* "`url_mask=`" means to replace a part of <url> with the current tab's URL
* "`reuse=`" can be: `0` (current tab) / `1` (reuse: if there's a tab whose URL is target URL, then go to it, otherwise open a new tab) / `-1` (new active tab) / `-2` (new background tab)

Therefore, when you press `<f7>`, Vimium C will
* find a `url_mask` option, so ask Chrome for the current tab's information
  * let's say the URL is "`http://www.example.com/query?kw=abc`"
* replace the "`$url`" part in `<url>` with the tab's URL
  * get "`vimium://parse g http://www.example.com/query?kw=abc`"
  * "`\u0020`" is the Unicode representation of the space character
* convert the `<url>` into a real, browser-supported URL,
  * find "`vimium://parse`", so go to parse query words
  * let's say there has been a parsing regexp for the website, then Vimium C can find the query words: [`abc`]
  * create a new URL using keyword "`g`", and get "`https://www.google.com/search?ie=utf-8&q=abc`"
* open the URL in a new background tab, since `<reuse>` is `-2`
