Vimium C has a powerful command named `runKey`.
Not only it can [run different keys on different page conditions](Map-a-key-to-different-commands-on-different-websites),
but also it supports command "trees" and runs different commands according to whether a previous command succeeds or not.

### Tree sytnax

When an key sequence item in `keys` in `runKey`'s options has `(`, `)`, `?`, `:`, `+` or `%`, it will be parsed as a command tree.
The basic syntax is:

* there're 3 types of node in a tree: key node, list node and branching node
* a key node means a single mapped command.
  * it can be `count prefix + mapped key sequence`, or one of available command names
  * when it means a mapped key, its key name can only include English letters and numbers.
    * for example, `3<c-f1>` will work as expected, but `<c-=>` is invalid and causes an error tip when running
      * since v1.96, this limit has been removed
    * when it means `<v-...>`, then `<v-` and `>` can be omitted
  * if it include `$c` or `%c`, then its count will be multipled by the count prefix of `runKey`, like `$c3g0`
  * since v1.93, it may have a suffix of `#key=url-encoded-val&key2=val2` as inline options
* a list node may include any number of child nodes
  * `+` is used to join its children, and it can be omitted if there's no ambiguity
  * for example, `3f1c` means to run `<v-f1c>` by 3 times; while `3f%cf` means `3f` and `%cf`
* a branching node means `if ... then ... else ...`
  * it syntax is `<condition> ["?" <then-branch>] [":" <else-branch>]`
  * either `?` or `:` can be omitted, so both `(a?)` and `(b:2c)` will work
* to specify priorities, use `(` and `)` to join some nodes into a list (node)

#### Execution order

* a key node runs a single command and returns "success" or "failure"
* a list node runs its children one by one
  * when a child node fails:
    * if the child is a key node, the list itself fails immediately, ignoring following nodes
    * otherwise, if the child is not the last one, then the list continues to run a next child
  * it returns the result of its last child node, or "success" if it's empty
* a branching node runs its condition node firstly
  * and then choose one between `then` and `else` branches according to whether the `condition` succeeds or not
  * it returns the result of its selected branch

#### Override options

Since v1.93, the syntax of inline options is:
* such string of inline options will end before `/[()?:+]/`, unless it matches `/(^|&)#/`
* option values are URL-decoded by default, except those after a second `#` character
* e.g.: `#a=1&b=2%2B3&#c=a?b:c&#4=+5%25` means `{ "a": 1, "b": "2+3", "c": "a?b:c&#4=+5%25" }`

To assign shared options, there're some ways:
* add `options={"key1":"val1","key2":"val2"}` to a `runKey` mapping
* add `"o."` prefix to option items, such as `o.key1="val1" o.key2="val2"`
* since v1.93, add a valid inline option string as the prefix of a key sequence.
  * for example, `#text=hello%20world+showHUD` will show a tip of "`hello world`"

#### Short syntax

Since v1.93.0, `map aaa runKey keys="bbb,ccc"` can be simplified into `run aaa bbb,ccc`.

### Example

To focus an input in a current frame, and when it fails, go to the top frame / scroll to top and then find an input again,
we may write:
```
map W scrollToTop
map i runKey keys="focusInput?:(mainFrame:W+150wait)%cfocusInput" \
  o.keep o.select="all-line" o.reachable \
  o.prefer="#js-issues-search,#searchEngines"
```

In the mapping above, `150wait` means to wait for 150 milliseconds, which allows page scripts to update UI state.

Here're some other valid examples in v1.93:

```
map <v-de> dispatchEvent

# simluate `Escape` on page scripts by press `Ctrl+]`
run <c-]:i> #key=Escape%2C27+de-de

# simulate `ArrowDown` and `ArrowUp` by `Ctrl+J` and `Ctrl+K`
env s element="select"
env t element="textarea"
run <c-j:i> #key=ArrowDown%2C40+de+-de,#key=ArrowUp%2C38+de+-de \
  expect="t:editText#run=auto%2ccount%2cline;s:scrollSelect"
run <c-k:i> -<c-j:i>
```

### Run a key after a command

There's a simpler way to run another key or command after one command: use `$then` and `$else` options since v1.92.

Most commands support 3 options of `$then: string`, `$else: string` and `$retry: number`.
* If such a command succeeds, then it triggers the mapped key or command name in `$then`;
  otherwise it triggers `$else`.
* By default, such a key mapping chain can include up to 7 commands (1 head and 6 following)
* If you want to allow a longer chain, use `$retry` to specify a longer number
  * if `$retry` is in `7 ~ 20`, then it's treated as `6`; if it's negative, then use its absolute number

Since v1.93, `$then` and `$else` can also include a suffix of inline options, like "`showHUD#text=hello`"

For example,
```
map i scrollToTop $then="focusInput" $else="<v-m>"
map <v-m> mainFrame $then="focusInput"
```
means:

* find an scrollable element and scroll to top
* if something is scrolled, then run `focusInput`
* otherwise, focus the main (top) frame and then run `focusInput`

#### Open Vomnibar after creating a new tab

There're multiple ways to do so:
```
# every line should work independently, with pre-defined mapping from `o` to `Vomnibar.activate`
map t createTab $then="Vomnibar.activate"
map t createTab $then="o"
map t runKey keys="createTab+Vomnibar.activate" # since v1.93.0
shortcut createTab $then="o"
```
