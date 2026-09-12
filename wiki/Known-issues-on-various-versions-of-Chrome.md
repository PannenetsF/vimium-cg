Here're some issues still existing on the master branch, which are mostly caused by Chrome bugs:

* If a page in another extension is the preferred Vomnibar page, and the extension is disabled in incognito mode,
  Vomnibar might break in such a situation, and there seems no way to detect it.
  So Vimium C has disabled other extension Vomnibar pages in incognito mode.
* *Before ver 41*, Chrome lacks some features so `parentFrame` may fail to find a real parent frame.
* *Before ver 42*, Chrome has a flag `#enable-embedded-extension-options` causing wrong dialog width on high-DPI screens,
  which can not be worked-around.
* *Before ver 48*, Chrome doesn't support touch events on normal pages,
  so LinkHints' touch option won't take effect.
* *Before ver 49*, Chrome has bugs in `Window.postMessage` if the flag `#enable-site-per-process` is on,
  which breaks `Vomnibar`. Then `Vomnibar` would only work well on Vimium C Options pages.
* If an http/file/... Vomnibar page is preferred, then there're some cases where it breaks,
  such as on some websites with very strict Content Security Policies (CSP),
  so users may need to wait about 1 second to let Vimium C retry the inner page.<br/>
  *Before ver 50*, such vomnibar webpages won't work because Chrome lacks some features,
  so Vimium C will use the inner page directly.
* *Since ver 56*, Chrome does not apply content settings (at least images) on file:// URLs.
  Currently, no effective ways have been found (up to Chrome 69).
* *Before ver 68*, Chrome has a bug on sandboxed pages without an `allow-scripts` permission in their CSP.
  So HUD will always be visible in order to solve some browser issues on Chrome *from ver 52 to 67*.<br/>
  While *before ver 52*, all functions of Vimium C will be broken on such pages.
* *When ver 64 and 65*, Chrome always cleans console logs if only Vomnibar is opened, and there's nothing we can do for it.
* *When ver 69*, Chrome disables `requestAnimationFrame` on some sandboxed pages, so Vimium C can not scroll them smoothly.
* *Before ver 72*, Chrome doesn't provide any method to detect how many navigation historys a page has,
  so "a large number" + "key for `goBack` / `goForward`" may fail silently.
* *When ver 83 (also 80 and 81 if `#cross-origin-isolation`)*, Chrome breaks Vomnibar on pages under an HTTP header of `Cross-Origin-Resource-Policy: cross-origin`.
* Currently, both [Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=968651) ~~and [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1561546)~~ won't trigger event listeners on dark mode or reduced motion changing on a extension's background,
  so Vimium C can not respond on such system settings changes at once, and has to recheck them every minute.
* *When ver 92, 93 and 94*, Chrome on Linux (but not Chromium itself) passes wrong `KeyboardEvent` info to pages and extensions,
  if the keyboard layout is not QWERTY-English. This triggers unexpected Vimium C commands and can not be fixed.

* On all versions of Chrome, a malformed page may hook user actions before Vimium C running, if only https://bugs.chromium.org/p/chromium/issues/detail?id=1261964 is not fixed.

### On macOS

- ~~https://bugs.chromium.org/p/chromium/issues/detail?id=1282945 : wrong keys with Chinese IME, [#526](https://github.com/gdh1995/vimium-c/issues/526))~~ (in doubt)
- https://bugs.chromium.org/p/chromium/issues/detail?id=1275011 : wrong keys with Chinese IME (English mode)

### For Manifest V3

- https://bugs.chromium.org/p/chromium/issues/detail?id=1152255 : no persistent background worker
- https://bugs.chromium.org/p/chromium/issues/detail?id=1160302 : no clipboard access
- https://bugs.chromium.org/p/chromium/issues/detail?id=1282890 : no injection into other extensions
- https://bugs.chromium.org/p/chromium/issues/detail?id=1219825 : no vomnibar on pages of rare protocols
- https://bugs.chromium.org/p/chromium/issues/detail?id=1054624 : no dynamic JS; maybe there's a work around
- https://bugs.chromium.org/p/chromium/issues/detail?id=1173354 : no WASM; affect a future feature of naming hints by PinYin
- https://bugs.chromium.org/p/chromium/issues/detail?id=1198822 : slow speed when start and higher CPU cost