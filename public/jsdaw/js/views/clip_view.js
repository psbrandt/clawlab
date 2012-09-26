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
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      this.audioSource.on ("bufferLoaded", this.bufferLoaded, this);
      this.model.on ("change:source_offset", this.sourceOffsetChanged, this)
    },

    render : function () {
      this.$el.html (this.template ({
        filename : this.audioSource.get ("filename")
      }));
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
    
    /** Set the buffer and render the clip */
    bufferLoaded : function () {
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
      var height = 75;
      // where to start in the buffer in seconds
      var begin_offset = this.model.get ("begin_offset");
      // where to end in the buffer in seconds
      var end_offset = this.model.get ("end_offset");
      // when the clip starts in the song
      var offset = this.model.get("source_offset") + begin_offset
      this.$el.css ({
        width : Claw.Helpers.secToPx (length),
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
      var offset = ui.offset.left - 200 // huh ... left-bar width
        + $("#sequencer").scrollLeft () // huh ... scroll
      console.log (offset);
      this.model.set ({
        source_offset : Claw.Helpers.pxToSec (offset)
      });
    }

  });
});