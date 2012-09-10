/**
 * The song version view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/main.html", 
  "views/track_view"
], function($, _, Backbone, mainTemplate, TrackView) {
  return Backbone.View.extend ({

    template : _.template (mainTemplate),

    initialize : function () {

      // listen when a track is created
      this.model.tracks.bind ("add", this.addTrack);

    },

    render : function () {
      // Append the main template
      $(this.el).html (mainTemplate);
      
      // Render tracks
      this.model.tracks.each (this.addTrack);
      
      return this;
    },

    addTrack : function (trackModel) {
      var trackView = new TrackView ({ model : trackModel });
      $("#tracks-controls").append (trackView.render().el);
    }
  });
});