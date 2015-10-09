# breakify.js
A simple JS script to break a list of sections into pages, with URL support to allow sharing of a specific page.

Javascript is evolving, therefore this script is written in Vanilla JS just for the sake of avoiding frameworks at least once and play around with ES6. Older browsers and cross-browser support is not a point either. Built and tested using Google Chrome 45.

## how to use
Breakify.js uses a configuration object, the following properties are supported:
- wrapperSelector: selector to match the wrapper of content to break into pages
- elementsSelector: selector to match elements representing each page inside wrapper
- changeUrl: set if and how the URL should be updated. Possible values are:
-- hash: uses hash
-- history: uses HTML5 History API
-- none: URL is not changed. This is the default when changeUrl is not specified.
- changeUrlKey: the string used to update the url when changeUrl is set to hash or history. Default is "page". Empty is allowed.

Breakify.js uses width of the wrapper to scroll the elements.

This is the constructor used in test page index.html
```javascript
var breakify = new BreakifyJS( { 
	wrapperSelector : ".js-breakify", 
	elementsSelector : "section",
	changeUrl : "hash",
	changeUrlKey : "test"
} );
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
BreakifyJS also supports asynchronous loading with a callback be passed in the script src.
Examples can be found in [index.html](index.html).
```HTML
<script>
  var breakify;
  function initBreakify() {
  	var breakify = new BreakifyJS( { 
  	  wrapperSelector : ".js-breakify", 
  	  elementsSelector : "section" 
    } );
  }
  </script>
  <script src="breakify.js?callback=initBreakify" async></script>
```
