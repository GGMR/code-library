/**
 * jQuery plugin. Basic form validator.
 *
 * @author Barry Jones <barry.jones@ggmr.co.uk>
 *     02/09/2014 - Created basic validator - required fields only.
 *     02/09/2014 - Added basic email and tel number formats based on regex validation.
 *     02/09/2014 - Added custom regex pattern validation. - NOTE: DONT use regex's with backslashes in!
 */
/**
 * This plug-in is designed to be framework-independent.
 * It removes native html5 validation to keep a consistent interface.
 * To configure for a given framework, simply override the classes and selectors used.
 */
;
(function($) {

    // Plugin Constructor
    var ggFormValidator = function(element, options) {

        /* Private */

        // Plugin default settings
        var _settings = $.extend({
            Debug: true,
            WidgetClass: 'enhanced-form',
            ValidationNodeClass: 'form-validation-message hidden',
            ValidationSubNodeClass: 'form-error',
            ValidationNodeMessage: 'Please ensure all required fields are filled in.',
	        ValidationControlHasErrorClass: 'form-has-error',
	        ControlGroupSelector: '.form-control-group'
        }, options || {});

        // Local vars
        var _node = $(element);
        var _id = null;
        var _validation_node = null;
        var _regexp = {
            tel: /^0{1}[1-9]{7,20}$/,
            email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        };

        // Constructor method
        var _init = function() {

            // Extract / create id and other attributes
            _id = this.GetSetNodeId(_node);
            _node.addClass(_settings.WidgetClass);

            // Build out any UI customisations..
            _enhanceWidget();

            /*
             Add your event handlers here
             */
            _node.on('submit', _submitForm);

            return _node;

        }.bind(this); // _init

        // Build the widget node
        var _enhanceWidget = function() {

            // Create the validation node
            _validation_node = $('<div/>')
                .addClass(_settings.ValidationNodeClass);
            _validation_node.append(
                $('<div/>').addClass(_settings.ValidationSubNodeClass)
                    .html(_settings.ValidationNodeMessage)
            );
            _node.prepend(_validation_node);

            // Disable html5 validation
            _node.attr('novalidate', 'novalidate');

            // Set validation state
            this.showValidationFailed(false);

            return _node;

        }.bind(this); // _enhanceWidget

        // Form submission handler
        var _submitForm = function(e) {

            // Reset previous attempts
            this.showValidationFailed(false);

            var _failed_fields = this.validateForm();
            if (_failed_fields.length > 0) {
                e.preventDefault();

                // Display validation errors
                if (_failed_fields.length > 0) {
                    _highlightValidationErrors(_failed_fields);
                    this.showValidationFailed(true);
                }

                return false;
            } else {
                return true;
            }
        }.bind(this);

        // Highlight validation errors
        var _highlightValidationErrors = function(failed_fields) {
            $.each(failed_fields, function() {
                $('#' + this).parents(_settings.ControlGroupSelector)
	                .addClass(_settings.ValidationControlHasErrorClass);
            });
            return this;
        }.bind(this);

        // Validate required fields
        var _validateRequiredFields = function($requireds) {

            // Iterate required fields and check for a value
            var _failed_fields = new Array();
            $requireds.each(function() {
                var $this = $(this);
                var fieldType = $this.attr('type');

                // if a valid regexp is found then validates against that
                if (_regexp[fieldType]) {
                    if (!_regexp[fieldType].test($this.val())) {
                        _failed_fields.push($this.attr('id'));
                    }
                } else {
                    // Generic non-specific validation
                    if ($this.is(':checkbox') && !$this.is(':checked')) {
                        _failed_fields.push($this.attr('id'));
                    } else if ($this.is(':radio') && ($('input[name="' + $this.attr('name') + '"]:checked').length == 0) ) {
	                    _failed_fields.push($this.attr('id'));
                    } else if (!$this.val() || ($this.val().length == 0)) {
                        // Deals with text boxes
                        _failed_fields.push($this.attr('id'));
                    }
                }
            });
            return _failed_fields;

        }.bind(this);

	    // Validate regex fields
	    var _validateRegExFields = function($regexs) {

		    // Iterate required fields and check for a value
		    var _failed_fields = new Array();
		    $regexs.each(function() {
			    var $this = $(this);
			    var pattern = $this.attr('pattern');
			    var reg = new RegExp(pattern);
			    if (!reg.test($this.val())) {
				    _failed_fields.push($this.attr('id'));
			    }

		    });
		    return _failed_fields;

	    }.bind(this);

        /* Public */

        // Get the element for this instance
        this.get = function() {
            return _node;
        }; // this.get

        // Validate the form. Return array of failed fields
        this.validateForm = function() {

	        try {

		        // Validate required fields
		        var _failed_fields = new Array();
		        var $requireds = $('[required]', _node);
		        _failed_fields = _validateRequiredFields($requireds);

		        // Validate regexs
		        var $regexs = $('[pattern]', _node);
		        _failed_fields = $.merge(_failed_fields, _validateRegExFields($regexs));

		        // Return failed fields
		        return _failed_fields;

	        } catch (e) {
		        console.log('Error in form.validator plug-in: ' + e.message);
		        return _failed_fields;
	        }


        }

        // Display the form validation message bar
        this.showValidationFailed = function(show) {
            if (show) {
                _validation_node.removeClass('hidden');
            } else {
                _validation_node.addClass('hidden');
                $(':input', _node).each(function() {
                    $(this).parents(_settings.ControlGroupSelector)
	                    .removeClass(_settings.ValidationControlHasErrorClass);
                });
            }
            return this;
        }

        // Utility: Return a nodes ID (create if none set)
        this.GetSetNodeId = function(node) {
            var $node = $(node),
                _id = false;
            if ($node.length > 0) {
                _id = $node.attr('id');
                if (!_id || (_id.length == 0)) {
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
    $.fn.ggFormValidator = function(options) {
        return this.each(function() {

            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('ggFormValidator')) return;

            // Pass options to plugin constructor
            var obj = new ggFormValidator(this, options);

            // Store plugin object in this element's data
            element.data('ggFormValidator', obj);

        });
    };

})(jQuery);

// Scope bind function - allows binding of external objects as "this" in functions
// We use this to fix the "bug" in javascript that doesnt assign the class to "this"
// for private functions, and also for overriding "this" in event handlers.
if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        var method = this,
            temp = function() {
                return method.apply(obj, arguments);
            };
        return temp;
    }
}