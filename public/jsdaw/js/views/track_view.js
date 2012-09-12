/**
 * The track view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/track_controls.html"
], function($, _, Backbone, trackControlsT) {
  return Backbone.View.extend ({
    
    template : _.template (trackControlsT),
    className : "track-controls",

    events : {
      "click .remove-track" : "removeTrackClicked",
    },

    initialize : function () {
      this.model.bind ("destroy", this.remove, this);
    },

    remove : function () {
      $(this.el).remove ();
      // TODO : remove clip
      // erase clip from canvas ?
    },

    render : function () {
      // setting up the data needed by the view
      var data = {
	name : this.model.get("name")
      };
      
      // Rendering controls
      $(this.el).html (this.template (data));
      $("#tracks-controls").append (this.el);

      // TODO : render clips
      // Drawing in a canvas ?

      return this;
    },

    removeTrackClicked : function () {
      this.model.delete ();
    }
  });
});