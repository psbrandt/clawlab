define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone, TrackCollection, Track) {
  var AudioSource = Backbone.Model.extend ({

    idAttribute : "_id",

    defaults : {
    },

    initialize : function (data) {
    }    
  });

  return AudioSource;
});