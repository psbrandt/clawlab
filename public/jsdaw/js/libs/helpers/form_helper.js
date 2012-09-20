/**
 *  Form building helpers
 */
define([
  'jquery'
], function($) {

  var Form = {

    createForm: function(action, method, callback, attrs) {
      // Ensure we get lowercase method name
      method = method.toLowerCase();

      // Build form container
      // Method must be POST if it's anything else than GET
      var $form = $('<form/>').attr({ action: action, method: ( method === 'get' ? 'get' : 'post' ) });

      // Append additional attributes if needed
      if(typeof attrs !== 'undefined')
        $form.attr(attrs);

      // Hidden fields container
      var $hidden_fields = $('<div/>').css({ margin: 0, padding: 0, display: 'inline' });

      // Always included hidden fields
      $hidden_fields.append(
        Form.createInput('hidden', 'authenticity_token', window.authenticityToken),
        Form.createInput('hidden', 'utf8', "✓")
      );

      // Append _method field if method is PUT or DELETE
      if(method === 'put' || method === 'delete')
        $hidden_fields.append( Form.createInput('hidden', '_method', method) );

      // Return whatever returns our callback, he's the one who decides
      // what's gwan di output
      return callback($form);
    },

    createInput: function(type, name, value, attrs) {
      var $input = $('<input/>').attr({ type: type, name: name }).val(value);

      // Append additional attributes if needed
      if(typeof attrs !== 'undefined')
        $input.attr(attrs)

      return $input
    }

  };

  return Form;
});