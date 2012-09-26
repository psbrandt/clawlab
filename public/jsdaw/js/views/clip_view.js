/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/clip.html",
  "libs/waveform"
], function($, _, Backbone, clipTemplate, Waveform) {
  return Backbone.View.extend ({

    template : _.template (clipTemplate),

    className : "clip",

    events : {
      "dragstop" : "dragStopped"
    },

    initialize : function () {
      var self = this;
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      this.audioSource.on ("bufferLoaded", this.bufferLoaded, this);
      this.model.on ("change:source_offset", this.sourceOffsetChanged, this)
    },

    render : function () {
      this.$el.html (this.template ());
      this.$el.draggable ({
        containment : "#timeline",
        scroll : true,
        axis : "x"
      });
      return this;
    },
    
    /**
     * When the buffer is loaded, update the el with right size and offset */
    bufferLoaded : function () {
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      // the lenght of the clip in seconds
      var length = this.buffer.duration - this.model.get ("begin_offset") 
        - this.model.get ("end_offset");
      // height in pixels
      var height = 75;
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
      console.log ("changed " + sourceOffset);
      this.$el.css ({
        left : Claw.Helpers.secToPx (sourceOffset + model.get ("begin_offset"))
      })
    },

    dragStopped : function (e, ui) {
      var offset = Math.max(0, ui.offset.left - 200) // huh ... left-bar width
      console.log (offset);
      this.model.set ({
        source_offset : Claw.Helpers.pxToSec (offset)
      });
    }

  });
});