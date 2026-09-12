The page gives a formal syntax to describe valid search engine rules for Vimium C.

Warning: The whole schema of search engine rules is so complicated that I suggest a glance over https://github.com/philc/vimium/wiki/Search-Engines.

## A Whole View

A rule, usual a line of text, consists of such parts:

`<keywords> ":" <url-pattern> ["blank="<url-for-blank-query>] [ [parsing-prefix] "re="<parsing-regexp>] <...display-name>`

Commonly, between every two neighboring parts can be any spaces.

If there's a <kbd>\\</kbd> at the end of a line, the next line will also be joined into the current line, before the rule gets parsed. While since Vimium C v1.76.2, a <kbd>\\\\</kbd> at line end means a single plain character of <kbd>\\</kbd>, without connecting lines.

## Keywords

A `<keywords>` can consist of multiple keywords: `<keyword1> ...["|" <other-keywords>]`

* all keywords will be used to refer the same search engine
* the first keyword will be used by commands like `searchAs`, `searchInAnother` and `Vomnibar.activateEditUrl`
* an keyword in later engines will override a previous one

## Url Pattern

`<url-pattern>` is used to build search URLs. Basically, it is **a common URL** whose query words are replaced with "`$s`" (or "`%s`", for backwards compatibility)
  * then Vimium C will "url-encode" and splice your query words using a delimiter of "`+`" and format a complete URL to open it
* "`$S`" (upper-case "S") can also be used, then the delimiter will be "` `" (an English space character), and non-English words will not be "url-encoded".
  * "`%S`" is treated just as "`$S`".
* if there's a "` `" (space character) following the "`\`" (backslash), then the next part is also treated as a part of `<url-pattern>`,<br/>
  and the "`\ `" is simplely translated into "` `" (a single space character)
* if after "`$s`" / "`$S`" is like "`{...}`", then the content means the delimiter of query words or the pattern of spliced text
  * for example, "`$s{_}`" means to "url-encode" and splice your query words using a delimiter of "`_`"
  * "`$s{$1/$2}` means to "url-encode" `<query-word1>` and `<query-word2>` and then splice them using a delimiter of "`/`",<br/>
    and all further more query words are abandoned
  * "`$s{$1/$+2}`" means: `<url-encoded_query-word1> "/" <url-encoded_query-word2> ...["+" <url-encoded_other-query-words>]`
  * "`$s{$1/$-1}`" means: `<url-encoded_query-word1> "/" <url-encoded_last-query-word>`
  * "`$s{$1/$0}`" means: `<url-encoded_query-word1> "/" <url-encoded_query-word1>  ...["+" <url-encoded_query-word_2-to-N>]`

## URL for Blank Query

If the query is empty, then return this URL on building, instead of replacing "`$s`" with an empty string.

## Parsing Regexp Pattern

`<parsing-regexp>` will be used by Vimium C to parse URLs of web pages, like Google search result pages, to learn what you're searching. This part can be omitted, and Vimium C will try its best to understand the <url-pattern> to find a parsing pattern. To write it, you need basic knowledgement about regexp

* `<parsing-prefix>` is used to match prefixes of page URLs, and a parsing regexp will be applied if only it gets matched
  * for `http://` / `https://` pages, this protocol part and "`://`" will be stripped before matching.
* the "`re=`" is necessary to make Vimium C recognize that a regexp begins
* the `<parsing-regexp>` part needs to be a valid JavaScript RegExp literal and can not include any space character ("` `")
  * its syntax can be found in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Description
* when parsing a URL, capturing groups will be splitted and then "url-decoded" to format query words,<br/>
  so if a group needs to be ignored, please use patterns like `(?:words of ignored group)`
  * the splitting is using the delimiter or pattern recognized from `<url-pattern>`
* if `<parsing-regexp>` is empty, then it means this rule doesn't need the parsing feature, and `<parsing-prefix>` should be empty

## Display Name

This part is "url-decoded" and then displayed on Vomnibar, and allows any white space character in it. If this part doesn't exist, then the last keyword is used as the main name.

## Notes

* If a line starts with "`#`", "`"`" or "`!`", it means a comment line and will be ignored.
* A keyword can not be "`__proto__`", otherwise it will be skipped
* In the recommended settings (can be imported on options page), there're some rules whose `<url-pattern>` is a simple "`.`". They're used to declare multiple parsing regexp patterns for the same keyword.
  * For example, the "`bing`" keyword has multiple rules, and most of them only contributes to parsing regexp patterns, while the last rule will override earlier "`.`"s and provide a real `<url-pattern>`.
