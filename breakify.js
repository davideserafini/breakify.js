/**
 * Breakify.js
 * 
 * @author 	Davide Serafini
 * @version	0.1
 * @since	2015-10-05
 */

"use strict";

class BreakifyJS {

	constructor( wrapperSelector, elementsSelector ) {

		// First, fire the request for the CSS file
		this._addCssFile();

		// Set selectors
		this.wrapperSelector = wrapperSelector;
		this.elementsSelector = elementsSelector;

		// Get DOM elements based on selector
		this.wrapper = document.querySelector( this.wrapperSelector );
		this.elements = this.wrapper.querySelectorAll( this.elementsSelector );

		// Set CSS classes, special properties and position
		this.wrapper.className += " breakifyWrapper";
		let wrapperWidth = window.getComputedStyle( this.wrapper ).width;
		let that = this;
		[].forEach.call( this.elements, function( element, index ) {

			// Move elements off screen
			if (index > 0) {
				element.style.transform = "translate3d(" + wrapperWidth + ", 0, 0)";
			}

			// Ensure CSS classes is added after moving the element offscreen to avoid triggering the transform3d animation for setup
			// TODO: better way then setTimeout of 10ms?
			setTimeout(function(){
				that._addClassesToElement( element );
			}, 10);

			if ( index == 0 ) {
				setTimeout(function(){
					that._refreshHeight();
				}, 20)
			}

			// Add index used for paging
			element.setAttribute( "breakify-page" , index );
		})

		// Set current page
		this._currentPage = 0;

		// Add paginator
		this._addPaginator();
	}

	_getNumber( number ) {
		if (!isNaN( number )) {
			return number;
		}
		if ( number === "auto" ) {
			return 0;
		}
		if ( number.indexOf("px") != -1 ) {
			return parseInt(number.replace( "px", ""), 10);
		}
	}

	_getTotalHeight( index ) {
		
		let paginatorTotalHeight = this._paginator.getHeight();
		
		let currentPageStyle = window.getComputedStyle( this._getPage( index ) );
		let pageHeight = this._getNumber( currentPageStyle.height );
		let pageTop = this._getNumber( currentPageStyle.top );
		let pageMarginTop = this._getNumber( currentPageStyle.marginTop );
		let pageMarginBottom = this._getNumber( currentPageStyle.marginBottom );
		let pagePaddingTop = this._getNumber( currentPageStyle.paddingTop );
		let pagePaddingBottom = this._getNumber( currentPageStyle.paddingBottom );
		let pageTotalHeight = Math.round( pageHeight + pageTop + pageMarginTop + pageMarginBottom + pagePaddingTop + pagePaddingBottom );

		return paginatorTotalHeight + pageTotalHeight;
	}

	_setHeight( newHeight ) {
		this.wrapper.style.height = newHeight +"px";
	}

	_refreshHeight() {
		this._setHeight( this._getTotalHeight( this._currentPage ) );
	}

	_addCssFile() {
		let cssTag = document.createElement( "link" );
		cssTag.href = "breakify.css";
		cssTag.type = "text/css";
		cssTag.rel = "stylesheet";
		document.getElementsByTagName( "head" )[0].appendChild( cssTag );
	}

	_addClassesToElement( element ) {
		element.className += " breakifySection breakifyAnim";
	}

	_addPaginator() {
		this._paginator = new Paginator( this.wrapper, this );
	}

	goToPreviousPage() {
		let currentPage = this._getPage( this._currentPage );
		let nextPageIndex = this._currentPage - 1;
		let nextPage = this._getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		// TODO: add a method for this?
		let wrapperWidth = window.getComputedStyle( this.wrapper ).width;
		let nextPageHeight = this._getTotalHeight( nextPageIndex );
		this._setHeight( nextPageHeight );
		currentPage.style.transform = "translate3d(" + wrapperWidth + ", 0, 0)";
		nextPage.style.transform = "translate3d(0, 0, 0)";

		this._currentPage--;

		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	goToNextPage() {
		let currentPage = this._getPage( this._currentPage );
		let nextPageIndex = this._currentPage + 1;
		let nextPage = this._getPage( nextPageIndex );

		if ( nextPage == null ) {
			console.log( "BreakifyJS: trying to get page " + nextPageIndex + ", but number of pages is " + this.elements.length);
			return;
		}

		nextPage.classList.remove( "breakifyHide" );

		// TODO: add a method for this?
		let wrapperWidth = window.getComputedStyle( this.wrapper ).width.replace( "px", "" );
		let nextPageHeight = this._getTotalHeight( nextPageIndex );
		this._setHeight( nextPageHeight );
		currentPage.style.transform = "translate3d(" + (-1 * wrapperWidth) + "px, 0, 0)";
		nextPage.style.transform = "translate3d(0, 0, 0)";

		this._currentPage++;

		setTimeout( function(){
			currentPage.classList.add( "breakifyHide" );
		}, 500 );
	}

	_getPage( index ) {
		// TODO: add a checkBounds method?
		if ( index >= 0 && index < this.elements.length ) {
			return this.elements[index];
		} else {
			return null;
		}
	}
}

class Paginator {

	constructor( wrapper, breakifyJS ) {
		this._paginatorWrapper = document.createElement( "div" );
		this._paginatorWrapper.className = "breakifyPaginatorWrapper";

		let linkPrev = document.createElement( "a" );
		linkPrev.innerHTML = "Prev";
		linkPrev.className = "breakifyPaginator breakifyLeft";

		let linkNext = document.createElement( "a" );
		linkNext.innerHTML = "Next";
		linkNext.className = "breakifyPaginator breakifyRight";

		let clear = document.createElement( "div" );
		clear.className = "breakifyClear";

		this._paginatorWrapper.appendChild( linkPrev );
		this._paginatorWrapper.appendChild( linkNext );
		this._paginatorWrapper.appendChild( clear );
		wrapper.insertBefore( this._paginatorWrapper, wrapper.firstChild );

		let breakifyHandle = breakifyJS;
		linkPrev.addEventListener( "click" , function( event ) {
			breakifyHandle.goToPreviousPage();
		}, false );
		linkNext.addEventListener( "click" , function( event ) {
			breakifyHandle.goToNextPage();
		}, false );
	}

	_getNumber( number ) {
		if (!isNaN( number )) {
			return number;
		}
		if ( number === "auto" ) {
			return 0;
		}
		if ( number.indexOf("px") != -1 ) {
			return parseInt(number.replace( "px", ""), 10);
		}
	}

	getHeight() {
		let paginatorStyle = window.getComputedStyle( this._paginatorWrapper );
		let paginatorHeight = this._getNumber( paginatorStyle.height );
		let paginatorTop = this._getNumber( paginatorStyle.top );
		let paginatorMarginTop = this._getNumber( paginatorStyle.marginTop );
		let paginatorMarginBottom = this._getNumber( paginatorStyle.marginBottom );
		let paginatorPaddingTop = this._getNumber( paginatorStyle.paddingTop );
		let paginatorPaddingBottom = this._getNumber( paginatorStyle.paddingBottom );

		return Math.round( paginatorHeight + paginatorTop + paginatorMarginTop + paginatorMarginBottom + paginatorPaddingTop + paginatorPaddingBottom );
	}

}


// Check DOM status to address when script is loaded asynchronously
// DOMContentLoaded might be already fired at this time
if ( document.readyState === "interactive" || document.readyState === "complete" ) {
    var breakify = new BreakifyJS( ".js-breakify", "section" );
} else {
	document.addEventListener( "DOMContentLoaded", function(event) {
		var breakify = new BreakifyJS( ".js-breakify", "section" );
	});
}