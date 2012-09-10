define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/transport.html"
], function($, _, Backbone, Track, transportT) {
  var transportView = Backbone.View.extend ({

    events : {
      "click #add-track-button" : "addTrackClicked"
    },

    render : function () {
      var data = {
        title : this.model.get("title")
      };
      var template = _.template (transportT, data);
      $(this.el).html(template);
      $("body").append (this.el);
      return this;
    },

    addTrackClicked : function () {
      this.model.tracks.add(new Track);
    }
  });
  
  return transportView;
});