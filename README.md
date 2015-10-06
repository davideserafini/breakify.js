# breakify.js
A simple JS script to break a list of sections into pages, with URL support to allow sharing of a specific page.

Javascript is evolving, therefore this script is written in Vanilla JS just for the sake of avoiding frameworks at least once. Older browsers and cross-browser support is not a point either.

## how to use
Breakify.js uses a configuration object, the following properties are supported:
- wrapperSelector: wrapper of the content to break into pages
- elementsSelector: element representing each page

Both must be valid selectors to be used by the querySelector. Breakify.js uses width of the wrapper to scroll the elements.
This is the constructor used in test page index.html
```javascript
var breakify = new BreakifyJS( { wrapperSelector : ".js-breakify", elementsSelector : "section" } );
```
Page structure is simply
```html
...
<div class="js-breakify">
  <section>
    <h2>section title</h2>
    text
  </section>
  <section>
    <h2>another section title</h2>
    more text
  </section>
</div>
...
```
