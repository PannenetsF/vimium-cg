If another extension accepts external messages, then you may use Vimium C to create and send arbitrary messages to it.

## Command usage

The key command is `sendToExtension` which accepts `id: str`, `data: Json-able` and `raw: boolean`.
- `id` is target ID of extension, which should look like a UUID on Chrome and Safari, while a mail address on Firefox
- `data` is the main message body to send, and it may be a string, number or JSON object
- `raw` is used to control message format
  - by default, a real message is:
    `{ "handler": "message", "from": "Vimium C", "count": command-count, "keyCode": last-keyCode, "data": data }`
  - if `raw` is `true`, then the sent message is `data` itself

If the target extension does
  [receive external messages](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external-webpage),
then it may return `false` to refuse messages from Vimium C and make `sendToExtension` fail;<br>
all other types of returned values will be treated as "success", and a `string` value will be shown in HUD.


## Examples

### Send url on Vomnibar to another extension

Add such key mappings:
```
# `itemSedKeys` is executed when the current selected is a suggestion on enter
# - use `sedKeys` when the current is the input itself
# then `itemKeyword` is used to build a new URL
map xxx Vomnibar.activate itemSedKeys="1" sedKeys="1" itemKeyword="sendUrl"
map <v-ste> sendToExtension id="ADDONID" raw
```

Add this to `Custome search engines`:
```
sendUrl: vimium://run/<v-ste>##data={"type":"create","params":{"url":"$1"}}
```

Add this to `Auto substitution of various text`:
```
# always encode a string to ensure `"${it}"` is a valid JSON string
1@^@@,json
```

See https://github.com/gdh1995/vimium-c/issues/573#issuecomment-1114758798 .

### Invoke ff2mpv 5.0.0+

To use `LinkHints` to select a link and then let [ff2mpv](https://github.com/woodruffw/ff2mpv) opens it:

1. add these to `Custom key mappings`:
```
map vvv LinkHints.activateOpenUrl sed="_ff2mpv"
# replace the id="**********" with id="ff2mpv@yossarian.net" on Firefox
map <v-ff2mpv> sendToExtension \
  id="ephjcajbkgplkjmelpglennepbpmdpjg" raw
```

2. add these to `Auto substitution of various text`:
```
_ff2mpv@^@@,encode
_ff2mpv@^.*@vimium://run1/<v-ff2mpv>#data={"type":"openVideo","url":"$0"}@
```

See https://github.com/gdh1995/vimium-c/issues/1077#issuecomment-1936979906 .
