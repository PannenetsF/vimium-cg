Here's how to install Vimium C from a zip package:

* unzip the zip file into an empty folder
* if on a Chromium-based browser, open `chrome://extensions/` and enable the "developer mode"
* if on Firefox, open `about:debugging#/runtime/this-firefox` manually
* click the "load extension" button and select the extension folder (Chromium) or `manifest.json` (Firefox)

When a test finishes, you may need to remove (uninstall) this developing package from the extension manager page, and then download and install Vimium C again from your browser's web store, so that your Vimium C can keep up-to-update when further versions get released.

#### Note

* if Firefox restarts, then such debugging extensions will disappear because of limitations of Firefox
* if Chrome restarts, it will always show a warning for debugging extensions
* debugging extensions **won't get any update**, so you may need to **remove it and reinstall Vimium C from web stores**