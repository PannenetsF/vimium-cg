#### Background

The macOS system usually maps <kbd>Option (Alt)</kbd> + <kbd>Printable character</kbd> keys to some infrequent symbols. For examples, <kbd>Option + S</kbd> means `ß` ([#1](#ref-1)).

#### Ignore system-level mapping

This feature often causes Vimium C get wrong key names, so Vimium C has [an option named `Ignore keyboard layout`](#ref-2) to avoid influence of keyboard layouts.

With this checked, Vimium C will always translate your keyboard actions using a English QWERTY-style layout (and also ignore status of CapsLock).

#### Ignore system-level mapping when Option is pressed

In some situation, the option seems to cause a much stronger constraint than users want. Then since v1.88.0, this option can be partly-checked, and provide a new way to ignore layouts **only when <kbd>Option (Alt)</kbd> is being pressed**.


#### Test for this system-level mapping

* open https://gdh1995.cn/vimium-c/keyboard-test.html
* click Vimium C's extension icon (at the top-right corner) and click "disable once" to make Vimium C temporarily disabled on the page
* enable "Prevent all keyboard events" if you want to test a non-printable (composed) key; otherwise disable the checkbox
4. then press keys like <kbd>K</kbd> and <kbd>Alt+C</kbd> to see what it will show.

#### Reference

1. <a name="ref-1"></a> https://www.webnots.com/option-or-alt-key-shortcuts-to-insert-symbols-in-mac-os-x/
2. <a name="ref-2"></a> Wiki: <a href="Use-in-another-keyboard-layout">How to use in another keyboard layout</a>