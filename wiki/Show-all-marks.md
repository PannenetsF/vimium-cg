Vimium C doesn't provide an inner UI to show global and local marks,
though `Marks.clearGlobal` and `Marks.clearLocal` can be used to clear all existing marks.
For those who do want to find them, here's some alternative ways.

### Viewing and removing marks on Vimium C Options page

Vimium C saves all local and global marks into its own `browser.storage.local`
    (since v1.97; on Chrome it's `chrome.storage.local`)
    or `localStorage`, so users can view and edit marks easily.

If one creates a local mark "p" on https://example.com/,
there will be a key created in the `localStorage` of that URL in the following format:

```text
vimiumMark|https://example.com/|p
```

Then, to show all marks:

- Open `Vimium C Options` page.
- Press the <kbd>F12</kbd> key to launch `Developer Tools` (on Windows; on macOS it's <kbd>Command + Option + J</kbd>)
- Select the `Console` tab.
- Enter the following command:

``` js
// since v1.97
(globalThis.browser || chrome).storage.local.get(res =>
    Object.keys(res).filter(v => /^vimium(Global)?Mark/.test(v)).forEach((x) => console.log(x)))
// before v1.97
Object.keys(localStorage).filter(v => /^vimium(Global)?Mark/.test(v)).forEach((x) => console.log(x))
```

And those lines starting with `vimiumMark` are local marks;
the other lines will start with `vimiumGlobalMark` and mean global marks.

To remove a mark, you need copy its mark name and enter the following command:

``` js
let markName = 'vimiumMark|chrome-extension://hfjbmagddngcpeloejdejnfgbamkjaeg/pages/options.html|a'
// since v1.97
void (globalThis.browser || chrome).storage.local.remove(markName)
// before v1.97
localStorage.removeItem(markName)
```

To remove all marks bound to `p` (the lower-case version of English letter `P`).

``` js
let mark = 'p'
let regex = new RegExp(`^vimium(Global)Mark.*\|${mark}$`)
// since v1.97
void (globalThis.browser || chrome).storage.local.get(res =>
    (globalThis.browser || chrome).storage.local.remove(Object.keys(res).filter(v => regex.test(v))))
// before v1.97
Object.keys(localStorage).filter(v => regex.test(v)).forEach((k, i) => localStorage.removeItem(k))
```
