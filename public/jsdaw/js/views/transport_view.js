define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/transport.html"
], function($, _, Backbone, Track, transportT) {
  return Backbone.View.extend ({

    events : {
      "click #add-track-button" : "addTrackClicked"
    },

    template : _.template (transportT),

    render : function () {
      var data = {
        title : this.model.get("title")
      };
      //render directly in body
      $("body").append (this.template (data));
      return this;
    },

    addTrackClicked : function () {
      this.model.addTrack ();
    }
  });
  
});