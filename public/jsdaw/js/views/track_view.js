/**
 * The track view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "views/clip_view"
], function($, _, Backbone, ClipView) {
  return Backbone.View.extend ({
    
    className : "track",

    events : {
      "drop .dropzone" : "dropped",
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
    },

    remove : function () {
      this.$el.remove ();
    },

    render : function () {
      this.$el.css ("height", this.model.get ("height"));
      var self = this;
      this.model.clips.each (function (clip) { self.addClip (clip)});

      return this;
    },

    addClip : function (clip) {
      var clipView = new ClipView ({ model : clip }).render ();
      
      this.$el.append (clipView.el);
    }

  });
});