/**
 * The track controls view
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
      "click .mute-btn" : "muteClicked"
    },

    muteClicked : function () {
      this.$el.find (".mute-btn").toggleClass ("active");
      this.model.set ("muted", !this.model.get ("muted"));
    },
    
    initialize : function () {
      this.model.bind ("destroy", this.remove, this);
    },

    remove : function () {
      this.$el.remove ();
    },

    render : function () {
      // setting up the data needed by the view
      var data = {
        id   : this.model.id, 
	name : this.model.get("name")
      };

      // Rendering controls
      this.$el.html (this.template (data));

      return this;
    },

    removeTrackClicked : function () {
      this.model.destroy ();
    }
  });
});