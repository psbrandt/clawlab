/**
 * A ghost track controls view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/ghost_track_controls.html",
], function($, _, Backbone, trackControlsT) {
  return Backbone.View.extend ({
    
    template : _.template (trackControlsT),
    className : "track-controls ghost-track-controls",

    events : {
      "click .mute-btn"        : "muteClicked",
      "click .solo-btn"        : "soloClicked",
      "click .merge-track-btn" : "mergeClicked"
    },

    initialize : function () {
      this.model.bind ("destroy", this.remove, this);
      this.model.on ("change:solo", this.soloChanged, this);
    },

    remove : function () {
      this.$el.remove ();
    },

    render : function () {
      // setting up the data needed by the view
      var data = {
        id     : this.model.id, 
	name   : this.model.get ("name"),
        volume : this.model.get ("volume"),
        status : this.model.get ("status"),
        avatar_url : this.model.get ("user").avatar_url
      };

      // Rendering controls
      this.$el.html (this.template (data));

      // Init tooltips
      this.$el.find ('[rel="tooltip"]').tooltip ();

      return this;
    },

    mergeClicked : function () {
      this.model.merge ();
    },

    soloChanged : function (model, solo) {
      this.$el.find (".solo-btn").toggleClass ("active", solo);      
    },

    muteClicked : function () {
      this.$el.find (".mute-btn").toggleClass ("active");
      this.model.set ("muted", !this.model.get ("muted"));
    },
    
    soloClicked : function () {
      this.$el.find (".solo-btn").toggleClass ("active");
      this.model.set ("solo", !this.model.get ("solo"));
    }
  });
});