define([
  "jquery",
  "underscore",
  "backbone",
], function($, _, Backbone) {
  var TrackModel = Backbone.Model.extend ({
    defaults : {
      name : "New track"
    },

    initialize : function (data) {
      
    }
  });
  return TrackModel;
});