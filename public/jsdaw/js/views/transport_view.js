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
      $(this.el).html (this.template (data));
      //render directly in body
      $("body").append (this.el);
      return this;
    },

    addTrackClicked : function () {
      this.model.addTrack ();
    }
  });
  
});