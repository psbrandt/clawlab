define([
  "jquery",
  "underscore",
  "backbone",
  "models/clip"
], function($, _, Backbone, ClipModel) {

  return Backbone.Collection.extend ({
    model : ClipModel
  });

});