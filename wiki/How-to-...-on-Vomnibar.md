1. How to always search queries case-insensitively?
 
- When mapping Vomnibar commands, add an option of `icase` in "Custom key mappings" on Vimium C Options.
- For example, `map o Vomnibar.activate icase`.

2. I don't want people to see my history in the bar when recording my screen. Or I don't want to search in tabs.

- Add `engines: Enum`: to do so. For example, `map o Vomnibar.activate engines=29`
- it may be a string including some words in `{ bookmark, history, tab, search, domain }`, such as `engines="search,history,bookmark"`
- it can also be composed flags of `bookmark = 1, history = 2, tab = 4, search = 8, domain = 16`, such as `15` (excluding domains)

3. How to switch what to search in when keep Vomnibar showing?

- Vomnibar (and also `v` mode in browser omnibox) uses a prefix of `":" + a letter + a space` to switch to other modes when showing
- For example, `Vomnibar.activate` searches in all by default, and a query of "`:b foo`" will only search "`foo`" in bookmarks
- available letters can be:
  - `o`: search in all
  - `b`: only bookmarks; `h`: only history items; `t`: all tabs; `d`: only domains; `s`: only custom search engines
  - `B`: like `o`, while bookmarks have higher scores than those history items which are at least 5 miniutes ago
  - `w`: like `t`, while only search in tabs of a current window
  - `W`: like `w`, while on Firefox it will also show those tabs [hidden in the browser level](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/hide)

4. How to change concrete styles of Vomnibar?

- Please see the page of [How to style the UI of Vimium C using custom CSS](Style-the-UI-of-Vimium-C-using-custom-CSS).
