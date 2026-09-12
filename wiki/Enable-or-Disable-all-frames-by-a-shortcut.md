Vimium C supports command URLs for switching exclusion keys dynamically, exclusions keys only for hooking and global shortcuts:
* It handles URLs like `vimium://status <enable|disable|toggle|reset>` specially
  * `enable` will make Vimium C enabled (just like no exclusion rules matched), on all iframes of a current tab
  * `disable` does conversed actions (just like `Keys` in exclusions is empty)
  * such status are temporary, and will be cleared when a tab gets reloaded / visits another URL
* Its `Keys` in exclusion rules can be used to specify an allow list of usable key mappings
  * if `keys` starts with `^ `, then following keys means an allow list
  * if not, the `keys` means a list of "composed keys", separated by space characters
* It provides some global shortcuts (those on `chrome://extensions/shortcuts` or Firefox's `about:addons`), and their function can be configured arbitrarily
  * `shortcut userCustomized1 command="openUrl" url="..."` (in custom key mappings) means to open a new tab when the shortcut `User Customized 1` gets triggered.

The 3 above are able to satisfy most needs to switch Vimium C statuses.

### Explain 3 statuses

On a page, Vimium C can be in one of 3 working statuses:
1. `enabled`: all key mappings can be triggered, and no pass keys are bound to the page
2. `partially disabled`: in normal mode, only a limited list of keys can work as the first key to trigger commands or other actions
    * if there has been a prefix key, like a number or `g` in the default mappings, then following keys won't be limited by `pass keys`
3. `disabled`: no keys (even `<esc>`) can work in a normal mode, unless you have used `vimium://status` to force a small allow list

The `disabled` status has some extra effects:
* if a page has been disabled when it loads (by the `Excluded URLs and keys` table),
  then Vimium C will uninstall its listeners on keyboard and document events
  * so a page will run almost as fast as there's no Vimium C on it
* if this status is entered from `vimium://status`, then it may has a small allow list,
  in order to allow users to trigger an allowed key to make Vimium C switch into another status

Normally, different frames in a same tab may have different statuses,
but a forced status entered from `vimium://status` will make all frames share a same status (and pass keys).

### How to toggle "pass keys"

**For example**: `map <f7> openUrl url="vimium://status/toggle/^\u0020<f7>"` in key mappings

**Explain**:
* `openUrl` means to execute specified URL / URLs, and following `url=` is a JSON-encoded URL
* the url above can also be written as `vimium://status toggle ^ <f7>` (replace some `/` with `\u0020`, a space character)
* `vimium://status` means to switch / setup working status of Vimium C for a current tab
* `toggle` means to switch among `enabled`, `disabled` and `reset`
* `^ <f7>` means that, when a next status is `disabled`, Vimium C will still hook `<f7>` and trigger commands.
  * you may also write multiple keys here, like `^ <f7> <f8> <c-i>` (joined using `\u0020`
* for a URL of `vimium://status/toggle/silent/[...keys]`, it will not show HUD on changing status

**Expected effect**: you can press <kbd>\<f7></kbd> and then Vimium C will turn off on a current tab; while a second <kbd>\<f7></kbd> will re-enable Vimium C.

Vimium C also supports `vimium://status reset`, which is used to clear temporary status and apply exclusion rules again.

### How to switch between two statuses

Since v1.87.0, Vimium C adds support for:
* `vimium://status toggle-disabled` can toggle between a default status and the `disabled` status
* `vimium://status toggle-enabled` can toggle between a default status and the `enabled` status
* `vimium://status toggle-next` can toggle among a default status, the `enabled` status and the `disabled` status

And then, if you don't want an enabled status before switching to disabled, then you may use `map <c-i> openUrl url="vimium://status/toggle-disable/^\u0020<c-i>"` and it's only for "default“ and "disabled".

### A 2-step way using the popup dialog

When you happen to want to disable Vimium C for a while, you can turn off it by clicking the Vimium C icon at the top-right corner of your browser window. Then it will show a popup dialog, and just click `Disable for once (X)` to make Vimium C completely disabled.

The disabled status will be kept on a current tab and until the tab is closed / refreshed. As for new iframes in the tab, they will inherit status of the top frame, and keep disabled.

When a page is disabled, you can also open the popup again and click `Enable for once` (or `Reset`) to re-enable Vimium C.