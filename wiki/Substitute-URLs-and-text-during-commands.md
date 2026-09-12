Vimium C has an advanced option named `Auto substitution of various text`.
It defines rules to match text fragments in URLs and normal text,
and magically replace them with different text (and even increased/decreased numbers).

### Substitution rule sytnax

Every line means a substitution rule, if only it starts with `A-Z`, `a-z` or non-ASCII characters.
A basic pattern is just like the `s` command in `sed` scripts: `keys/regexp/replacement/flags[,actions...]`.

* a `keys` prefix includes 1\~6 characters of `a-z` (ignoring cases) and non-ASCII letters,
  and it means 1\~6 aliases of a rule. A special rule is, an `s` character means both `c` and `p`
  * since v1.93, `keys` may includes `0-9` and `_`
  * some commands of Vimium C will only use `a-z` as its default sed keys, so all others are customizable
* the `/` character may be uniformly replaced by any other single ASCII character
  which doesn't match `/[\x00-\x20A-Za-z\x7f]/`.
  And, just like `/` in `sed` scripts, the `/` character (or whatever other character is used in its stead)
  can appear in the regexp or replacement only if it is preceded by a `\` character.
  For example, you may use `@`, `=`, and `~`
* the `regexp` section (along with the `flags` section) is used to construct a JavaScript RegExp (valid on your browser)
* the `replacement` is used as the `newSubstr` parameter during replacement, just like
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
* the `actions` can be omitted, and it's a list of Vimium C's substitution conditions and actions joined by `,`

#### Substitution conditions and actions

Here're some valid actions (ignoring cases):

* `host=<exclusion-pattern>` can be used to filter prefix of an input URL (text).
  If a `host` does not match, then it will be skipped even if its aliases match.
* `matched` means to return its instantiated `replacement`, a first capture group, or whole matched string,
  instead of replacing result, as the input of (other) actions. This is an unique action.
  Since v1.92.1, the `=<pattern>` part is case-sensitive. This is an unique action.
* `base64` (aka `atob`) and `base64-encode` (aka `btoa`) are used as `atob()` and `btoa()` in JavaScript
* `decode` and `decode-comp` are used as URL decoding and URL component decoding
* `encode` and `encode-comp` encode characters which are neither Unicode letters nor numbers
* `encode-all` and `encode-all-comp` encode characters which are neither Unicode letters nor numbers
* `unescape` decodes `\x**`, `\u****`, `\t`, `\n` and `\r`
* `lower`, `upper` and `normalize` converts text using `String.toLocaleLowerCase`, `toLocaleUpperCase` and `normalize`
* `capitalize`, `capitalize-all`, `camel` and `hyper` means to convert some words to a different style
* `reverse` can reverse all characters in text (supporting surrogate pairs like emoji)
* `return` (only since v1.92.1) means to ignore any further rules and return at once

Most actions work after replacing and in the order of definitions,
while only `host` and `matched` take effects before or when `<regexp>` works,

Actions names also support camel mode, like `encodeAll`.

#### Substitution examples

```
u@/wiki/?$@@g,host=github.com
# will make `goUp` skip home page of a Wiki.

r@^https://github\.com/[^\s\/?#]+/[^\s\/?#]+(?=/)@@,matched,return
# will make `goToRoot` stop at project home, if only current tab is a child page, like an issue.
```

### Refer to rules

A key mapping line may refer to some substitution rules using an option named `sedKeys`,
and it should be a string including a list of aliases.
Vimium C executes rules following the order of their definitions.

A key mapping may also use `sed=<substitution-rule>` to define and use temporary rules.
In this situation, `keys` prefixes will be ignored, and different rules should be joined using ` ` (`<space>`).

Some commands have default `sedKey`:
* when copying text, use `c`; while use `p` during pasting from clipboard
* `goNext` and `goPrevious` use `n`
* `goUp` use `g` to modify (correct) upper URLs
* `goToRoot` use `r` to modify source URLs, and if a different URL is returned, then use it directly
* when selected text or link title is used as URL and opened, use `t`
* when on Vomnibar input query is opened (no suggestion is selected), use `o`
* when opening image on `Vimium C Display`, image URL will be converted using `i`


### Construct URL using current URL

Commands like `openUrl` and `createTab` can create new URLs using information of a current tab,
  like URL, host, title and even tabId.

To do this, `openUrl` needs both `url` and `url_mask` options:

* `url` means a URL template
* `url_mask`, `host_mask`, `title_mask` and `tabId_mask` point out how to fill the template
* if a mask doesn't have a value, then it will become an empty string
* `url_mask` must exist and be a string. If it's not needed, please make it an empty string using `url_mask=`
* if `url_mask` is `%s` or `$s`, then it will be replaced by an encoded URL; otherwise, by a raw URL
* tab title will always be encoded

For example,
```
map xxx openUrl url="http://webcache.googleusercontent.com/search?q=cache:$s" url_mask="$s"
```
will open a cached version (on Google's server) of a current tab (in a new tab, by default).


### Go next to another number

`goNext` and `goPrevious` support further substitution to increase / decrease numbers in URLs.

They find `${N/[start]:[end]:[step]}` sections in result text of `Auto substitution of various text`,
increase (or decrease) `N` by `step`, and use result numbers to construct a new URL.

* `N` means old page number in a URL
* `[start]:[end]:[step]` is just a similar syntax in Python, and can be used to limit result number
  * `start` and `end` should be non-negative integers, while `step` can also be a negative integer
* `${` prefix and `}` are used to recognize number sections to update
* `/` can be replaced with `,`, `#` and `@`

For example, when with a rule in `Auto substitution of various text` of:
```
n@tid=(\d+)@tid=$${$1/::2}@
```
"`tid=123`" in a source URL will:

* become "`tid=${123/::2}`" (note "`$$`" in `<replacement>` means a single "`$`" character)
* then `goNext` calculates `max(0, min(123 + 2, +Infinity))` and gets `125`
* become "`tid=125`"


### Copy information of tabs

`copyWindowInfo` supports customizable formats for copied text.
Its `format` parameter means how to format information of a tab,
and `join` parameter will join strings of tabs by given string, using `\n` or in JSON.

By default, `format` is `${title}: ${url}`, and you may use other fields
  in the [Tab](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab) class.
URLs are encoded, unless `copyWindowInfo` has another parameter of `decoded` (aka `decoded=true`).

When `join` is not defined, `false` or `true`, strings are joined using `\n`,
  and appended with a tail `\n` when `join` is not `false`.
When it's `json` (or `json***` since v1.92.1), strings are converted into an JSON array.
When it's other string, it will be used as the separator.

There's also a string parameter named `type` to specify where to copy information:

* `window`, its default value, means all tabs in a current window
* `browser` means tabs in all windows which have a same incognito state with a current window
* `tab` works with the command's count prefix, to select some tabs
* `url` and `title` means only URL or title of a current tab, so `format` and `join` will be ignored
* `frame` means URL of an active iframe in a current tab

Since v1.92.1, `copyWindowInfo` supports a string parameter named `filter`,
  some words joined by `,` or ` ` (`<space>`), to filter tabs by URL parts or titles:

* one word can be `url`, `urlWithHash`, `host`, to decide what URL part to use
* the other word can be `title`, and if it exists, also filter by tab titles
