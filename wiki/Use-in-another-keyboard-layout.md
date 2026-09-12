By default, Vimium C has a list of key mappings for English keyboard layout, and then for computer systems which are neither in English nor with an IME, Vimium C is not out-of-the-box. Therefore here's some tips about how to use Vimium C comfortably on a different keyboard layout.

## “mapKey” directive

Firstly, Vimium C supports **a feature of "`mapKey`", which has quite a few differences (since v1.76)** compared with https://github.com/philc/vimium/wiki/Tips-and-Tricks#key-mapping . For example, for a key mapping line of `map ф a`, it will make Vimium C translate all keys with a main part of `ф` and zero or more modifier keys.
* the main part will be changed to "`a`", an English letter which is lower-case format of "`A`"
* then modifier keys will be taken into consideration
  * if `Shift` key is being pressed (and no other modifier keys), the whole key will be translated into "`A`"
  * if only `Ctrl` and `Shift` keys are being pressed, the translation result will be "`<c-s-a>`"

**For beginners: Please remember that `mapKey` only takes effects inside Vimium C.**

**Before v1.80.1, This directive takes effects in normal mode** (a mode when no mapped key is pressed and all commands have finished), 
**`LinkHints` mode** and **visual mode** (entered from the command "`enterVisualMode`").

**Since v1.80.1, this directive takes effects in all modes**.

### Per-mode mapKey

<a name="pre-mode-mapkey"></a>
V1.80.1 also adds a feature of per-mode mapping. For example, `mapkey <f:o> <f2>` will only make `Vomnibar` treat `f` as `<f2>`, while not in others modes. In this example `o` means Vomnibar, and you can also use `i` (Insert Mode), `l` (LinkHints), `f` (FindMode), `v` (VisualMode) and `m` (Marks).

Since v1.98.0, `mapKey <xxx:v> <v-yyy>` (as well as `:f` and `:o` ) will trigger commands mapped to `<v-yyy>`, thought some in-page commands may not work when Vomnibar is focused. And there're some new modes: `n` (normal mode - neither special modes, nor prefix keys of mappings), `e` (there have been some prefix keys, like `g` in `gf`).

```
i - insert mode
l - link hints
f - find mode
v - visual mode
m - marks
o - omnibar
n - normal mode and no prefix keys
e - normal mode and a prefix key has been pressed
s - on `vimium://show` only
```

### Tips

There're some other usages and tips of "mapKey":
* not only a character in one language can be mapped to one in another language, but also characters in a same language may be mapped at will
* if a key's text representation is longer than 1 character, then it should be wrapped in "`<`" and "`>`"
* **all the mappings can only be recongnized inside Vimium C**, and your browser and other web extensions don't know them
* if the source key is not a single character, or it is UPPER CASE, then only the entirely matched key will be translated
  * that is, for `mapKey F g`, Vimium C will translate every `F` key (`Shift` is on, other modifier keys are off) to a lower case character `g`,
  * but other keys like `<a-f>` and `<c-s-f>` are kept unchanged
  * and for `mapKey <esc> <f13>`, Vimium C will translate a single <kbd>Escape</kbd> key to <kbd>F13</kbd> key
* If there's `mapKey <f1> <esc>`, then <kbd>F1</kbd> key can be used to exit some modes of Vimium C, just like the native <kbd>Escape</kbd>
* The `unmapAll` directive will also cancel all previously defined "mapKey" rules

## Map a keyboard layout to English

With the help of "mapKey", now it's possible to make Vimium C ignore difference among several keyboard layouts. So you just need to map all keys in your keyboard layout to the corresponding English ones. Some relations may be found on https://en.wikipedia.org/wiki/Keyboard_layout and http://xahlee.info/kbd/keyboard_layout_keybinding.html , though you may need to verify all web information by yourself.

### An example for Cyrillic layout (Russian and Ukrainian)

This list is authored by [@ww7](https://github.com/ww7) and copied from https://github.com/gdh1995/vimium-c/issues/39#issuecomment-511213704 .

``` vim
mapKey й q
mapKey ц w
mapKey у e
mapKey к r
mapKey е t
mapKey н y
mapKey г u
mapKey ш i
mapKey щ o
mapKey з p
mapKey х [
mapKey Х {
mapKey ъ ]
mapKey Ъ }
mapKey ї ]
mapKey Ї }
# <space> after \
mapKey ё \ 
mapKey Ё |
mapKey ґ \ 
mapKey Ґ |
mapKey ф a
mapKey ы s
mapKey і s
mapKey в d
mapKey а f
mapKey п g
mapKey р h
mapKey о j
mapKey л k
mapKey д l
mapKey ж ;
mapKey Ж :
mapKey э '
mapKey Э "
mapKey є '
mapKey Є "
mapKey я z
mapKey ч x
mapKey с c
mapKey м v
mapKey и b
mapKey т n
mapKey ь m
mapKey б ,
mapKey Б <
mapKey ю .
mapKey Ю >
# '.' and ',' overrides (disables this keys for mappings)
mapKey . / 
mapKey , ?
```

The line of "`# <space> after \`" is to solve a bug before Vimium C v1.76.2, which is about the line connector character "`\`". Since Vimium C v1.76.2 you may write `mapKey ё \\` (two "`\`" characters before a line feeding character) to map "`ё`" to "`\`".

### Persian (Standard) layout

This layout was manually created on a Macbook Pro 2016.

```
mapKey ض q 
mapKey ص w 
mapKey ث e 
mapKey ق r 
mapKey ف t 
mapKey غ y 
mapKey ع u 
mapKey ه i 
mapKey خ o 
mapKey ح p 
mapKey ج [ 
mapKey چ ] 
mapKey ش a 
mapKey س s 
mapKey ی d 
mapKey ب f 
mapKey ل g 
mapKey ا h 
mapKey ت j 
mapKey ن k 
mapKey م l 
mapKey ک ; 
mapKey گ ' 
mapKey ظ z 
mapKey ط x 
mapKey ز c 
mapKey ر v 
mapKey ذ b 
mapKey د n 
mapKey پ m 
mapKey و , 
mapKey . . 
mapKey ْ Q 
mapKey ٌ W 
mapKey ٍ E 
mapKey ً R 
mapKey ُ T 
mapKey ِ Y 
mapKey َ U 
mapKey ّ I 
mapKey ] O 
mapKey [ P 
mapKey } { 
mapKey { } 
mapKey | | 
mapKey ؤ A 
mapKey ئ S 
mapKey ي D 
mapKey إ F 
mapKey أ G 
mapKey آ H 
mapKey ة J 
mapKey » K 
mapKey « L 
mapKey : : 
mapKey ؛ " 
mapKey ك Z 
mapKey ٓ X 
mapKey ژ C 
mapKey ٰ V 
mapKey ‌ B 
mapKey ٔ N 
mapKey ء M 
mapKey < < 
mapKey > > 
mapKey ؟ ? 
mapKey ٬ @ 
mapKey ٫ # 
mapKey ﷼ $ 
mapKey ٪ % 
mapKey × ^ 
mapKey ، & 
mapKey ) ( 
mapKey ( ) 
mapKey ـ _ 
mapKey ۱ 1 
mapKey ۲ 2 
mapKey ۳ 3 
mapKey ۴ 4 
mapKey ۵ 5 
mapKey ۶ 6 
mapKey ۷ 7 
mapKey ۸ 8 
mapKey ۹ 9 
mapKey ۰ 0 
```

### Greek Layout (new) 

This has been manually created and tested on a qwerty linux laptop

```vim
mapKey ; q
mapKey ς w
mapKey ε e
mapKey ρ r
mapKey τ t
mapKey υ y
mapKey θ u
mapKey ι i
mapKey ο o
mapKey π p
mapKey α a
mapKey σ s
mapKey δ d
mapKey φ f
mapKey γ g
mapKey η h
mapKey ξ j
mapKey κ k
mapKey λ l
mapKey ´ ;
mapKey ¨ :
mapKey ζ z
mapKey χ x
mapKey ψ c
mapKey ω v
mapKey β b
mapKey ν n
mapKey μ m
```