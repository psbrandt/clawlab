/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/clip.html",
  "libs/waveform",
  "jqueryui"
], function($, _, Backbone, clipTemplate, Waveform) {
  return Backbone.View.extend ({

    template : _.template (clipTemplate),

    className : "clip",

    events : {
      "dragstop"   : "dragStopped",
      "dragstart"  : "dragStarted",
      "drag"       : "dragging",
      "selected"   : "selected",
      "unselected" : "unselected"
    },

    initialize : function () {
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );

      this.model.on ("change:source_offset", this.sourceOffsetChanged, this)
      this.model.on ("destroy", this.remove, this);

      // If the audio source was not found, return
      if (this.audioSource == undefined) {
        return;
      }
      this.buffer = Claw.Player.buffers[this.audioSource.get("id")];

      this.audioSource.on ("change:bufferLoaded", this.bufferLoaded, this);
    },

    render : function () {
      var data = {}
      // if the audio source is not found set filename to "not found"
      try {
        data.filename = this.audioSource.get ("audio_filename")
      } catch (e) { data.filename = "error : file not found" }
      this.$el.html (this.template (data));

      // not working ...
      this.$el.resizable ({
        handles : "e, w"
      });

      this.$el.draggable ({
        containment : "parent",
        scroll : true,
        scrollSensitivity : 40,
        axis : "x"
      });
      // Hack to remove position set to relative by default
      this.$el.css ("position", "absolute");

      if (this.buffer) this.drawWaveform ()

      return this;
    },

    remove : function () {
      this.$el.remove ();
    },

    selected : function () {
      this.model.set ("selected", true);
    },

    unselected : function () {
      this.model.set ("selected", false);
    },

    /** Set the buffer and render the clip */
    bufferLoaded : function (model, bufferLoaded) {
      if (!bufferLoaded) return;
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      this.render ();
    },

    /**
     * Update the el with right size and offset. Buffer need to be loaded */
    drawWaveform : function () {
      // the lenght of the clip in seconds
      var length = this.buffer.duration - this.model.get ("begin_offset") 
        - this.model.get ("end_offset");
      // height in pixels
      var height = 75; //huh ..

      // where to start in the buffer in seconds
      var begin_offset = this.model.get ("begin_offset");
      // where to end in the buffer in seconds
      var end_offset = this.model.get ("end_offset");
      // when the clip starts in the song
      var offset = this.model.get("source_offset") + begin_offset
      this.$el.css ({
        left : Claw.Helpers.secToPx (offset)
      }).find ("canvas").attr ({
        width : Claw.Helpers.secToPx (length),
        height : height
      })
      new Waveform ({
        canvas : this.$el.find ("canvas")[0],
        data : this.buffer.getChannelData (0)
      });
    },

    sourceOffsetChanged : function (model, sourceOffset) {
      this.$el.css ({
        left : Claw.Helpers.secToPx (sourceOffset + model.get ("begin_offset"))
      })
    },

    dragStarted : function (e, ui) {
      this.alsoDrag = $("#tracks .ui-selected").not (this.$el);
      _.each (this.alsoDrag, function (el) {
        $(el).data ("offset", $(el).position ());
      });
      this.offset = ui.position.left;
    },

    dragging : function (e, ui) {
      var dl = ui.position.left - this.offset;
      _.each (this.alsoDrag, function (el) {
        var prev_offset = $(el).data ("offset");
        $(el).css ("left", prev_offset.left + dl);
        return true;
      });
    },

    dragStopped : function (e, ui) {
      _.each (this.alsoDrag, function (el) {
        $(el).trigger ("dragstop");
      })
      this.model.set ({
        source_offset : Claw.Helpers.pxToSec (this.$el.position ().left)
      });
    }

  });
});