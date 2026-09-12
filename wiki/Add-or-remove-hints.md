Commands like `LinkHints.*` supports some options to use CSS selectors to add / filter out special page elements.

* `clickable` will mark matched elements as clickable
* `match` will limit `LinkHints` to only show hints for specific elements
* `exclude` will exclude some elements from the list of found elements

For example, `map f LinkHints.activateMode clickable=".link,.button" exclude=".link-container"`
  will add `<i class="link"/>` while exclude `<div class="link link-container">...</div>`.

Please notice that these will affect the startup time of `LinkHints`.
So you may need to trigger `LinkHints` with
  [different options on different websites](Map-a-key-to-different-commands-on-different-websites).

For example, this can hide elements with `[role=heading]`on Google search result pages:
```
env g host=":https://www.google.com/search?"
run f <v-f> expect="g:<v-gf>"
map <v-f> LinkHints.activate
map <v-gf> LinkHints.activate exclude="[role=heading]"
```

Since v1.98.1, `LinkHints` supports `clickableOnHost: string` and `excludeOnHost`:
* `clickableOnHost` should be a list of `host-css_selector-rule`s joined by `;` character
* a `host-css_selector-rule` includes `host-regexp` and `css-selector`, joined by `##` (somehow like syntax in μBlock Origin)
* a `host-regexp` is a valid RegExp to match some website domains
* a `css-selector` can be a simple selector or a list of simple selectors joined by `,`

For example, Vimium C has a built-in `excludeOnHost` list to make LinkHints look better on search result pages:
```
\bgoogle##.g;\bbing\.com##.b_algo;\bbaidu\.##.c-container;\bmail.ru\b##.SnippetResultInfo-favicon
```

### 中文版

<a name="zh"></a>
> Comment: _this section is just translation of all the above into Chinese._
> <br>提示: 本小节和上一节内容相同，仅为翻译。

`LinkHints` 系列命令支持一些参数来筛选、添加要提示的元素，不过需要懂些 CSS 知识。

* `clickable` 可以把相应元素标记成“可点击的”
* `match` 可以限制 `LinkHints` 只对特定元素显示提示
* `exclude` 最后生效，可以排除一些不想要的元素

比如 `map f LinkHints.activateMode clickable=".link,.button" exclude=".link-container"`
  表示标记 `<i class="link"/>` 但排除 `<div class="link link-container">...</div>`。

请注意：上述参数都会影响 `LinkHints` 的启动速度，所以您可以参考
  [此处（英文）](Map-a-key-to-different-commands-on-different-websites)
  来为不同网站设置不同的 `LinkHints` 命令参数。

### Knowledge of CSS Selector / CSS 选择器相关知识

Introduction: https://www.w3schools.com/css/css_selectors.asp

Introduction and document: https://developer.mozilla.org/en-US/docs/Glossary/CSS_Selector

中文介绍（Document in Chinese）： https://developer.mozilla.org/zh-CN/docs/Glossary/CSS_Selector
