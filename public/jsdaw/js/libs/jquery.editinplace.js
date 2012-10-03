(function ($) {
  var __slice = [].slice;
  $.fn.editInPlace = function() {
    var method, options;
    method = arguments[0], options = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.each(function() {
      var methods;
      methods = {
        init: function(options) {
          var cancel, valid,
          _this = this;
          valid = function(e) {
            var newValue;
            newValue = _this.input.val();
            return options.onChange.call(options.context, newValue);
          };
          cancel = function(e) {
            _this.el.show();
            return _this.input.hide();
          };
          this.el = $(this).dblclick(methods.edit);
          return this.input = $("<input type='text' />").insertBefore(this.el).keyup(function(e) {
            switch (e.keyCode) {
            case 13:
              return $(this).blur();
            case 27:
              return cancel(e);
            }
          }).blur(valid).hide();
        },
        edit: function() {
          this.input.val(this.el.text()).show().focus().select();
          return this.el.hide();
        },
        close: function(newName) {
          this.el.text(newName).show();
          return this.input.hide();
        }
      };
      if (methods[method]) {
        return methods[method].apply(this, options);
      } else if (typeof method === 'object') {
        return methods.init.call(this, method);
      } else {
        return $.error("Method " + method + " does not exist.");
      }
    });
  };
})(jQuery);