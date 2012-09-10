define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/transport.html"
], function($, _, Backbone, transportT) {
  var transportView = Backbone.View.extend ({
    render : function () {
      var data = {
        title : this.model.get("title")
      };
      var template = _.template (transportT, data);
      $("body").append (template);
    }
  });
  
  return transportView;
});