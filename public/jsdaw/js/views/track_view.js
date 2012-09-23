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
      "drop .dropzone" : "dropped"
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
      $(this.el).remove ();
      // TODO : remove clip
      // erase clips from canvas ?
    },

    render : function () {
      // setting up the data needed by the view
      var data = {
        id   : this.model.id, 
	name : this.model.get("name")
      };
      
      // Rendering controls
      $(this.el).html (this.template (data));

      // temporarily droppable
      $(".dropzone", this.el).droppable ();

      var self = this;
      this.model.clips.each (function (clip) { self.addClip (clip)});

      return this;
    },

    addClip : function (clip) {
      var view = new ClipView ({ model : clip });
      Claw.SequencerView.appendClip (
        view.render (),
        this
      );
    },

    removeTrackClicked : function () {
      this.model.destroy ();
    }
  });
});