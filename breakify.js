/**
 * Breakify.js
 * 
 * @author 	Davide Serafini
 * @version	0.1a
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
		this.wrapper = document.querySelectorAll( this.wrapperSelector )[0];
		this.elements = this.wrapper.querySelectorAll( this.elementsSelector );

		// Set CSS classes, special properties and position
		this.wrapper.className += " breakifyWrapper";
		let wrapperWidth = window.getComputedStyle(this.wrapper).width;
		let that = this;
		[].forEach.call( this.elements, function( element, index ){

			// Move elements off screen
			if (index > 0) {
				element.style.transform = "translate3d(" + wrapperWidth + ", 0, 0)";
			}

			// Ensure CSS classes is added after moving the element offscreen to avoid triggering the transform3d animation for setup
			// TODO: better way then setTimeout of 10ms?
			setTimeout(function(){
				that._addClassesToElement( element );
			}, 10)

			// Add index used for paging
			element.setAttribute("breakify-page", index);
		})

		// Add paginator
		this._addPaginator();
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
		let paginatorWrapper = document.createElement("div");

		let linkLeft = document.createElement("a");
		linkLeft.innerHTML = "Prev";
		linkLeft.className = "breakifyPaginator breakifyLeft";

		let linkRight= document.createElement("a");
		linkRight.innerHTML = "Next";
		linkRight.className = "breakifyPaginator breakifyRight";

		let clear = document.createElement("div");
		clear.className = "breakifyClear";

		paginatorWrapper.appendChild(linkLeft);
		paginatorWrapper.appendChild(linkRight);
		paginatorWrapper.appendChild(clear);
		this.wrapper.insertBefore(paginatorWrapper, this.elements[0]);
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