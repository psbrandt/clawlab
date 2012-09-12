/**
 * The song version view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/main.html", 
  "views/track_view",
  "views/root_action_view",
  "views/sequencer_view"
], function($, _, Backbone, mainTemplate, TrackView, RootActionView, SequencerView) {
  return Backbone.View.extend ({

    template : _.template (mainTemplate),

    initialize : function () {

      // listen when a track is created
      this.model.tracks.bind ("add", this.addTrack);
      this.model.on ("change", function () {console.log ("df")});
    },

    render : function () {
      // Setting #main with the main template
      $(this.el).html (this.template ());
      
      // Rendering sequencer
      new SequencerView ({
        el : $("#sequencer")
      }).render ();

      // Render tracks
      this.model.tracks.each (this.addTrack);
      
      // Render action tree
      new RootActionView ({
        model : this.model.root_action,
        el : $("#action-tree", this.el)
      }).render ();

      return this;
    },

    addTrack : function (trackModel) {
      new TrackView ({ model : trackModel }).render ();
    }
  });
});