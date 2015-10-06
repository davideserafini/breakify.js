"use strict";
/**
 * Breakify.js
 *
 * A simple JS script to break a list of sections into pages, with URL support to allow sharing of a specific page.
 * 
 * @author 	Davide Serafini
 * @version	0.2
 * @since	2015-10-05
 */
var BreakifyJS = ( function( configObj ) {

	var wrapperSelector, elementsSelector, 
		wrapper, elements, 
		paginator, 
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

			let linkPrev = document.createElement( "a" );
			linkPrev.innerHTML = "Prev";
			linkPrev.className = "breakifyPaginator breakifyLeft";

			let linkNext = document.createElement( "a" );
			linkNext.innerHTML = "Next";
			linkNext.className = "breakifyPaginator breakifyRight";

			let clear = document.createElement( "div" );
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
			let paginatorStyle = window.getComputedStyle( paginatorWrapper );
			let paginatorHeight = _getNumber( paginatorStyle.height );
			let paginatorTop = _getNumber( paginatorStyle.top );
			let paginatorMarginTop = _getNumber( paginatorStyle.marginTop );
			let paginatorMarginBottom = _getNumber( paginatorStyle.marginBottom );
			let paginatorPaddingTop = _getNumber( paginatorStyle.paddingTop );
			let paginatorPaddingBottom = _getNumber( paginatorStyle.paddingBottom );

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
	 * Main constructor for BreakifyJS object
	 */
	function _constructor( configObj ) {

		// Set selectors
		wrapperSelector = configObj.wrapperSelector;
		elementsSelector = configObj.elementsSelector;

		// Get DOM elements based on selector
		wrapper = document.querySelector( wrapperSelector );
		// TODO: change to getelementsbyclassname if selector starts with .
		elements = wrapper.querySelectorAll( elementsSelector );

		// Set current page
		currentPageIndex = 0;

		// Add paginator
		paginator = new Paginator();

		// Set CSS classes, special properties and position
		wrapper.className += " breakifyWrapper";
		let wrapperWidth = window.getComputedStyle( wrapper ).width;

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
		let paginatorTotalHeight = paginator.getHeight();
		
		let currentPageStyle = window.getComputedStyle( _getPage( index ) );
		let pageHeight = _getNumber( currentPageStyle.height );
		let pageTop = _getNumber( currentPageStyle.top );
		let pageMarginTop = _getNumber( currentPageStyle.marginTop );
		let pageMarginBottom = _getNumber( currentPageStyle.marginBottom );
		let pagePaddingTop = _getNumber( currentPageStyle.paddingTop );
		let pagePaddingBottom = _getNumber( currentPageStyle.paddingBottom );
		let pageTotalHeight = Math.round( pageHeight + pageTop + pageMarginTop + pageMarginBottom + pagePaddingTop + pagePaddingBottom );

		return paginatorTotalHeight + pageTotalHeight;
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
	function prevPage() {
		let currentPage = _getPage( currentPageIndex );
		let nextPageIndex = currentPageIndex - 1;
		let nextPage = _getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		let wrapperWidth = _getNumber(window.getComputedStyle( wrapper ).width);
		let nextPageHeight = _getTotalHeight( nextPageIndex );
		_setHeight( nextPageHeight );
		nextPage.style.transform = "translate3d(0, 0, 0)";
		currentPage.style.transform = "translate3d(" + wrapperWidth + "px, 0, 0)";

		currentPageIndex--;

		// Hide hidden page to improve performance
		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	function nextPage() {
		let currentPage = _getPage( currentPageIndex );
		let nextPageIndex = currentPageIndex + 1;
		let nextPage = _getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex + ", but number of pages is " + elements.length);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		let wrapperWidth = _getNumber(window.getComputedStyle( wrapper ).width);
		let nextPageHeight = _getTotalHeight( nextPageIndex );
		_setHeight( nextPageHeight );
		currentPage.style.transform = "translate3d(" + (-1 * wrapperWidth) + "px, 0, 0)";
		nextPage.style.transform = "translate3d(0, 0, 0)";

		currentPageIndex++;

		// Hide hidden page to improve performance
		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	// Call the constructor function automatically when a Paginator instance is created
	_constructor( configObj );

	var publicInterface = {
		init : _constructor,
		goToPreviousPage : prevPage,
		goToNextPage : nextPage
	}

	return publicInterface;

});