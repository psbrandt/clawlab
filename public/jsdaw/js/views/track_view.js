/**
 * The track view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/track_controls.html",
  "views/clip_view"
], function($, _, Backbone, trackControlsT, ClipView) {
  return Backbone.View.extend ({
    
    template : _.template (trackControlsT),
    className : "track-controls",

    events : {
      "click .remove-track" : "removeTrackClicked",
      "drop .dropzone" : "dropped",
      "click .mute-btn" : "muteClicked"
    },

    muteClicked : function () {
      this.$el.find (".mute-btn").toggleClass ("active");
      this.model.set ("muted", !this.model.get ("muted"));
    },
    
    dropped : function (e, ui) {
      var sourceOffset = Claw.Helpers.pxToSec (
        Math.max (0, ui.offset.left - this.$el.width())
      );
      this.model.addClip (ui.helper.context.id, sourceOffset);
    },

    initialize : function () {
      this.model.bind ("destroy", this.remove, this);
      this.model.clips.on ("add", this.addClip, this);
      this.kineticNode = new Kinetic.Group ();
    },

    remove : function () {
      this.$el.remove ();
      this.kineticNode.parent.remove (this.kineticNode);
      this.kineticNode.getLayer ().draw ();
    },

    render : function () {
      // setting up the data needed by the view
      var data = {
        id   : this.model.id, 
	name : this.model.get("name")
      };
      
      // Rendering controls
      this.$el.html (this.template (data));

      // kinetic
      this.kineticNode.setY (
        this.model.get ("height") * this.model.get ("index"));

      $(".dropzone", this.el).droppable ();

      var self = this;
      this.model.clips.each (function (clip) { self.addClip (clip)});

      return this;
    },

    addClip : function (clip) {
      var clipView = new ClipView ({ model : clip }).render ();
      this.kineticNode.add (clipView.kineticNode);
      // Try to redraw parent layer. Will fail when adding a clip
      try { 
        this.kineticNode.getLayer ().draw (); 
      } catch (e) {
        // the node was not added in a layer yet
      }
    },

    removeTrackClicked : function () {
      this.model.destroy ();
    }
  });
});