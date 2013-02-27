var jQuery = (function() {

	// Define a local copy of jQuery
	var jQuery = function(selector, context) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init(selector, context, rootjQuery);
	};

	jQuery.fn = jQuery.prototype = {
		constructor : jQuery,
		init : function(selector, context, rootjQuery) {

			return jQuery.makeArray(selector, this);
		}
	};

	// Give the init function the jQuery prototype for later instantiation
	jQuery.fn.init.prototype = jQuery.fn;

	// All jQuery objects should point back to these
	rootjQuery = jQuery(document);

	return jQuery;

})();
