/**
 * The track controls view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/track_controls.html",
  // jquery plugins at the end
  "libs/jquery.editinplace"
], function($, _, Backbone, trackControlsT) {
  return Backbone.View.extend ({
    
    template : _.template (trackControlsT),
    className : "track-controls",

    events : {
      "click .remove-track"  : "removeTrackClicked",
      "click .mute-btn"      : "muteClicked",
      "click .solo-btn"      : "soloClicked",
      "slide .volume-slider" : "slid",
      "slidestop .volume-slider" : "slideStopped"
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
        volume : this.model.get ("volume")
      };

      // Rendering controls
      this.$el.html (this.template (data));

      this.$el.find (".volume-slider").slider({
        range : "min",
        step  : 0.01,
        min   : 0,
        max   : 1,
        value : this.model.get ("volume")
      });

      // Trigger tooltips
      this.$el.find ('[rel="tooltip"]').tooltip ();

      this.$name = $(".name", this.el).editInPlace ({
        context : this,
        onChange : this.setName
      })

      return this;
    },

    /* Update the model on slide */
    slid : function (e, ui) {
      this.$el.find (".volume-display").html (ui.value);
      this.model.set ("volume", ui.value);
    },

    /* On slide volume stop, save the model */
    slideStopped : function (e, ui) {
      this.$el.find (".volume-display").html (ui.value);
      this.model.save ("volume", ui.value);
    },

    setName : function (name) {
      if (name == this.model.get ("name")) {
        this.$el.find (".name").editInPlace ("close");
        return;
      }
      var self = this;
      this.model.save ({ name : name }, { success : function (o, data) {
        self.$el.find (".name").editInPlace ("close", data.name);
      }}); 
    },

    removeTrackClicked : function () {
      this.model.destroy ();
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