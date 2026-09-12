# Using Link Hints
Link hints are used for activating links with keystrokes.

If you want to add or remove some hints, you may try https://github.com/gdh1995/vimium-c/wiki/Add-or-remove-hints .

(Page content below is forked from https://github.com/philc/vimium/wiki/Using-Link-Hints).

## Alphabet Hints
The default is a link-hint mode called *alphabet hints*.  When you type `f`,
Vimium identifies clickable things on the current page, and puts a label beside
each.  To activate a link, you enter the characters in the label associated
with the thing you want to click.

Although hints are shown in upper case, you type them in lower case.

## Filtered Hints
On the options page, you can choose to use *filtered hints* instead of alphabet
hints.  With filtered hints, the labels beside each clickable thing consist of
digits.  However, instead of typing those digits, you can also type the link
text itself.  Vimium excludes links which do not match the text you have typed.  And
when just one link is left, it is activated.

One advantage of filtered hints over alphabet hints is that you know -- before
hitting `f` -- what characters to type to activate a link (whereas with
alphabet hints you need to wait to see what label is chosen for a link).

Some tips for filtered hints:

- There is always an *active hint*, its digits are all shaded.  Hitting
  `<enter>` at any point activates the active hint.

- You can use `<tab>` to change the active hint.  For example, if the active
  hint is labelled `1` and the link you want is labelled `2`, then
  `<tab><enter>` will activate it.

- Vimium scores links, and tries to select the best-matching link as the active
  hint.  Hints get a higher score if the text you type matches the start of the
  link's text, or the start of a word, or a whole word.  Usually, if you type
  characters at the start of the link's text, then Vimium very quickly selects the
  link you're after.

- There is a setting on the options page which requires you to hit `<enter>` to
  activate a link by typing its link text.  This avoids the (common) problem of
  unintentionally executing Vimium commands after the link has been activated.

## Hidden Hint Markers

Sometimes, one hint marker obscures another.  Use `<space>` to rotate the stacking order.

If you use filtered hints, you'll have to add a modifier (e.g. `<c-space>`).
