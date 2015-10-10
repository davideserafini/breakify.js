"use strict";
/**
 * Breakify.js
 *
 * A simple JS script to break a list of sections into pages, with URL support to allow sharing of a specific page.
 * 
 * @author 	Davide Serafini
 * @version	0.3
 * @since	2015-10-05
 */
var BreakifyJS = ( function( configObj ) {

	var config = {
		wrapperSelector : ".js-breakify",
		elementsSelector : "section",
		changeUrl : "none",
		changeUrlKey : "page"
	}

	var wrapper, elements, 
		paginator, 
		urlLinker,
		currentPageIndex;

	/**
	 * Provide prev/next links DOM and event binding
	 */
	function Paginator() {

		// Wrapper of pagination links
		var paginatorWrapper;

		function _constructor() {
			paginatorWrapper = document.createElement( "div" );
			paginatorWrapper.className = "breakifyPaginatorWrapper";

			var linkPrev = document.createElement( "a" );
			linkPrev.innerHTML = "Prev";
			linkPrev.className = "breakifyPaginator breakifyLeft";

			var linkNext = document.createElement( "a" );
			linkNext.innerHTML = "Next";
			linkNext.className = "breakifyPaginator breakifyRight";

			var clear = document.createElement( "div" );
			clear.className = "breakifyClear";

			paginatorWrapper.appendChild( linkPrev );
			paginatorWrapper.appendChild( linkNext );
			paginatorWrapper.appendChild( clear );
			wrapper.insertBefore( paginatorWrapper, wrapper.firstChild );

			linkPrev.addEventListener( "click" , function( event ) {
				publicInterface.goToPreviousPage();
			}, false );
			linkNext.addEventListener( "click" , function( event ) {
				publicInterface.goToNextPage();
			}, false );
		}

		/**
		 * Get total height of pagination div
		 */
		function getHeight() {
			var paginatorStyle = window.getComputedStyle( paginatorWrapper );
			var paginatorHeight = _getNumber( paginatorStyle.height );
			var paginatorTop = _getNumber( paginatorStyle.top );
			var paginatorMarginTop = _getNumber( paginatorStyle.marginTop );
			var paginatorMarginBottom = _getNumber( paginatorStyle.marginBottom );
			var paginatorPaddingTop = _getNumber( paginatorStyle.paddingTop );
			var paginatorPaddingBottom = _getNumber( paginatorStyle.paddingBottom );

			return Math.round( paginatorHeight + paginatorTop + paginatorMarginTop + paginatorMarginBottom + paginatorPaddingTop + paginatorPaddingBottom );
		}

		// Call the constructor function automatically when a Paginator instance is created
		_constructor();

		// "Public" interface
		return {
			getHeight : getHeight
		}

	}

	/**
	 * UrlLinker
	 */
	function UrlLinker() {

		var UrlLinkerToUse;

		var EmptyUrlLinker = ( function() {

			function setPage() {}
			function getPage() { return null; }

			return {
				setPage : setPage,
				getPage : getPage
			}
		});

		var HashUrlLinker = ( function() {
			
			function setPage( page ) {
		 		window.location.hash = "#" + config.changeUrlKey + page;
		 	}

		 	function getPage() {
		 		var hash = window.location.hash.substring(1);
		 		var value = hash.replace( config.changeUrlKey, "");
		 		return value != "" ? value : 0;
		 	}

		 	return {
		 		setPage : setPage,
		 		getPage : getPage
		 	}
		});

		var HistoryUrlLinker = ( function() {
			
			var realPageUrl = document.URL;

			function setPage( page ) {
				var finalUrl = realPageUrl;
				if ( realPageUrl.lastIndexOf( "/" ) != realPageUrl.length - 1 ) {
					finalUrl += "/";
				}
				window.history.replaceState( null, config.changeUrlKey + page, finalUrl + config.changeUrlKey + page );
		 	}

		 	function getPage() {
		 		// Assume that the last /KEY# in the Url, if any, is the state. Empty KEY is avoided here.
		 		if ( config.changeUrlKey != "" ) {
			 		if ( window.location.href.indexOf( config.changeUrlKey ) == -1 ) {
			 			return 0;
			 		}
			 		var path = window.location.pathname.split( "/" );
			 		var value;
			 		for ( let pathStep of path ) {
			 			if ( pathStep.indexOf( config.changeUrlKey ) == 0 ) {
			 				value = pathStep.replace( config.changeUrlKey, "");
			 				break;
			 			}
			 		}

			 		return value != "" ? value : 0;
			 	} else {
			 		return window.location.pathname.split( window.location.pathname.lastIndexOf( "/" ) );
			 	}
		 	}

		 	return {
		 		setPage : setPage,
		 		getPage : getPage
		 	}
		});

	 	switch ( config.changeUrl ) {
	 		case "hash":
	 			UrlLinkerToUse = HashUrlLinker();
	 			break;
	 		case "history":
	 			UrlLinkerToUse = HistoryUrlLinker();
	 			break;
	 		case "none":
	 		default:
	 			UrlLinkerToUse = EmptyUrlLinker();
	 	}


	 	return {
	 		setPage : UrlLinkerToUse.setPage,
	 		getPage : UrlLinkerToUse.getPage
	 	}
	 }

	/**
	 * Main constructor for BreakifyJS object
	 */
	function _constructor( configObj ) {

		config = _mergeObject( config, configObj );

		// Get DOM elements based on selector
		wrapper = document.querySelector( config.wrapperSelector );
		elements = wrapper.querySelectorAll( config.elementsSelector );

		// Set current page
		currentPageIndex = 0;

		// Add paginator
		paginator = new Paginator();

		// Get UrlLinker
		urlLinker = new UrlLinker();

		// Set CSS classes, special properties and position
		wrapper.className += " breakifyWrapper";
		var wrapperWidth = window.getComputedStyle( wrapper ).width;

		[].forEach.call( elements, function( element, index ) {

			// Move elements off screen
			if ( index > 0 ) {
				element.style.transform = "translate3d(" + wrapperWidth + ", 0, 0)";
			}

			// Add CSS classes
			element.className += " breakifySection breakifyAnim" + ( index > 0 ? " breakifyHide" : "");

			// Refresh height after the first page has been created
			if ( index == 0 ) {
				_refreshHeight();
			}

			// Add index used for paging
			element.setAttribute( "breakify-page" , index );
		})

		goToPage( urlLinker.getPage() );
	}

	/**
	 * Convert CSS properties to number
	 *
	 * Remove any "px" suffix when present, return always 0 otherwise if the argument is not already a number.
	 */
	function _getNumber( number ) {
		if (!isNaN( number )) {
			return number;
		}
		if ( number === "auto" ) {
			return 0;
		}
		if ( number.indexOf("px") != -1 ) {
			return parseInt( number.replace( "px", ""), 10 );
		}
	}

	/**
	 * Get page by index
	 */
	function _getPage( index ) {
		if ( index >= 0 && index < elements.length ) {
			return elements[ index ];
		} else {
			return null;
		}
	}

	/**
	 * Get total height (page + paginator)
	 */
	function _getTotalHeight( index ) {
		var paginatorTotalHeight = paginator.getHeight();
		
		var currentPageStyle = window.getComputedStyle( _getPage( index ) );
		var pageHeight = _getNumber( currentPageStyle.height );
		var pageTop = _getNumber( currentPageStyle.top );
		var pageMarginTop = _getNumber( currentPageStyle.marginTop );
		var pageMarginBottom = _getNumber( currentPageStyle.marginBottom );
		var pagePaddingTop = _getNumber( currentPageStyle.paddingTop );
		var pagePaddingBottom = _getNumber( currentPageStyle.paddingBottom );
		var pageTotalHeight = Math.round( pageHeight + pageTop + pageMarginTop + pageMarginBottom + pagePaddingTop + pagePaddingBottom );

		return paginatorTotalHeight + pageTotalHeight;
	}

	function _mergeObject( target, source ) {
		return Object.assign({}, target, source );
	}

	/**
	 * Convenience method to update height
	 *
	 * @see _getTotalHeight( index )
	 * @see _setHeight ( newHeight )
	 */
	function _refreshHeight() {
		_setHeight( _getTotalHeight( currentPageIndex ) );
	}

	/**
	 * Set new height
	 */
	function _setHeight( newHeight ) {
		wrapper.style.height = newHeight +"px";
	}



	/* Public Methods */
	function goToPage ( index ) {
		if ( index == null ) {
			return;
		}
		var pageToGo;
		if ( currentPageIndex < index ) {
			pageToGo = index - currentPageIndex;
			for ( let i = 0; i < pageToGo; i++ ) {
				goToNextPage();
			}
		} else if ( currentPageIndex > index ) {
			pageToGo = currentPageIndex > index;
			for ( let i = pageToGo; i > 0; i++ ) {
				goToPrevPage();
			}
		}
	}
	function goToPreviousPage() {
		var currentPage = _getPage( currentPageIndex );
		var nextPageIndex = currentPageIndex - 1;
		var nextPage = _getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		var wrapperWidth = _getNumber(window.getComputedStyle( wrapper ).width);
		var nextPageHeight = _getTotalHeight( nextPageIndex );
		_setHeight( nextPageHeight );
		nextPage.style.transform = "translate3d(0, 0, 0)";
		currentPage.style.transform = "translate3d(" + wrapperWidth + "px, 0, 0)";

		currentPageIndex--;

		urlLinker.setPage( currentPageIndex );

		// Hide hidden page to improve performance
		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	function goToNextPage() {
		var currentPage = _getPage( currentPageIndex );
		var nextPageIndex = currentPageIndex + 1;
		var nextPage = _getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex + ", but number of pages is " + elements.length);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		var wrapperWidth = _getNumber(window.getComputedStyle( wrapper ).width);
		var nextPageHeight = _getTotalHeight( nextPageIndex );
		_setHeight( nextPageHeight );
		currentPage.style.transform = "translate3d(" + (-1 * wrapperWidth) + "px, 0, 0)";
		nextPage.style.transform = "translate3d(0, 0, 0)";

		currentPageIndex++;

		urlLinker.setPage( currentPageIndex );

		// Hide hidden page to improve performance
		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	// Call the constructor function automatically when a BreakifyJS instance is created
	_constructor( configObj );

	var publicInterface = {
		init : _constructor,
		goToPreviousPage : goToPreviousPage,
		goToNextPage : goToNextPage,
		goToPage : goToPage
	}

	return publicInterface;

});

// Check if this was called asynchronously 
( function() {
	// Get this sript from DOM and its real src
	var thisScript = document.querySelector( "script[ src *= 'breakify.js']" );
	var thisScriptSrc = thisScript.src;

	// CHeck if a callback was provided
	if ( thisScriptSrc.indexOf( "callback=" ) != -1 ) {
		let callbackName;
		let queryString = thisScriptSrc.substring( thisScriptSrc.indexOf( "?" ) + 1 );
		let queryParamsPairs = queryString.split( "&" );
		for ( let param of queryParamsPairs) {
			if ( param.indexOf( "callback=" ) == 0 ) {
				callbackName = param.substring( "callback=".length );
				break;
			}
		}

		if ( callbackName != null ) {
			window[ callbackName ]();
		}
	}
} )()

