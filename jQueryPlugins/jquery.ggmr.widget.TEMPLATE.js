/**
 * jQuery plugin. <Description here>.
 *
 * @author Barry Jones <barry.jones@ggmr.co.uk>
 */
;(function ($) {

	// Plugin Constructor
	var ggWidgetTemplate = function (element, options) {

		/* Private */

		// Plugin default settings
		var _settings = $.extend({
			Debug           : true,
			WidgetClass     : 'template'
		}, options || {});

		// Local vars
		var _node               = $(element);
		var _id                 = null;

		// Constructor method
		var _init = function () {

			// Extract / create id and other attributes
			_id         = this.getSetNodeId(_node);
			_node.addClass(_settings.WidgetClass);

			// Build out any UI customisations..
			_enhanceWidget();

			/*
				Add your event handlers here
			 */

			return _node;

		}.bind(this); // _init

		// Build the widget node
		var _enhanceWidget = function(){

			/*
				Any UI customisations here
			 */


			return _node;

		}.bind(this); // _enhanceWidget

		/* Public */

		// Get the element for this instance
		this.get = function () {
			return _node;
		}; // this.get

		// Utility: Return a nodes ID (create if none set)
		this.getSetNodeId = function(node){
			var $node = $(node), _id = false;
			if ($node.length > 0){
				_id = $node.attr('id');
				if (!_id || (_id.length == 0)){
					_id = '_' + new Date().getTime() + '_' + Math.floor(Math.random() * 101);
					$node.attr('id', _id);
				}
			}
			return _id;
		}


		/* Construct! */
		_init();

	};

	// Plug-in handling
	$.fn.ggWidgetTemplate = function (options) {
		return this.each(function () {

			var element = $(this);

			// Return early if this element already has a plugin instance
			if (element.data('ggWidgetTemplate')) return;

			// Pass options to plugin constructor
			var obj = new ggWidgetTemplate(this, options);
			//element = $(obj.get());

			// Store plugin object in this element's data
			element.data('ggWidgetTemplate', obj);

		});
	};

})(jQuery);

// Scope bind function - allows binding of external objects as "this" in functions
// We use this to fix the "bug" in javascript that doesnt assign the class to "this"
// for private functions, and also for overriding "this" in event handlers.
if (!Function.prototype.bind) {
	Function.prototype.bind = function (obj) {
		var method = this, temp = function () {
			return method.apply(obj, arguments);
		};
		return temp;
	}
}