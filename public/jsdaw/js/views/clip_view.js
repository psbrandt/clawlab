/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "libs/waveform"
], function($, _, Backbone, Waveform) {
  return Backbone.View.extend ({

    initialize : function () {
      var self = this;
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );
      var offset = Claw.Helpers.secToPx (this.model.get ("source_offset"));
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      this.audioSource.on ("bufferLoaded", this.bufferLoaded, this);
      this.kineticNode = new Kinetic.Shape ({
        x : offset,
        drawFunc : function () {},
        //width : this.buffer ? Claw.Helpers.secToPx (this.buffer.duration) : 0,
        fill: {
          start : {
            x : 0,
            y : 0,
            radius : 0
          },
          end : {
            x : 0,
            y : 75,
            radius : 0            
          },
          colorStops: [0, "rgba(0,0,0,0.5)", 0.1, "rgba(255,255,255,0)", 0.9, 
                       "rgba(255,255,255,0)", 1, "rgba(0,0,0,0.5)"]
        },
        stroke : "FFA500",
        strokeWidth : 1,
        draggable : true,
        dragConstraint : "horizontal",
        dragBounds : {
          left:1
        }
      })

      this.kineticNode.on ("dragend", function (e) {
        self.dragStopped (e);
      });
    },
    
    bufferLoaded : function () {
      this.buffer = Claw.Player.buffers[this.audioSource.id];
      // the lenght of the clip in seconds
      var length = this.buffer.duration - this.model.get ("begin_offset") 
        - this.model.get ("end_offset");
      // the width in pixels
      var width = Claw.Helpers.secToPx (length);
      // height in pixels
      var height = 75;
      //where to start in the buffer in seconds
      var begin_offset = this.model.get ("begin_offset");
      // where to end in the buffer in seconds
      var end_offset = this.model.get ("end_offset");

      var self = this;
      this.kineticNode.setDrawFunc (function (ctx) {
        ctx.beginPath ();
        new Waveform ({
          context : ctx,
          width : width,
          height : height,
          innerColor : "black",
          data : self.buffer.getChannelData(0)
        });
        ctx.closePath ();

        // Draw a rectangle for 
        ctx.beginPath ();
        ctx.moveTo (0, 0);
        ctx.lineTo (0, height);
        ctx.moveTo (width, 0);
        ctx.lineTo (width, height);
        // Calling this.stroke on context draw stroke using kinetic node config
        this.stroke (ctx);
        ctx.rect (0, 0, width, height);
        // Calling this.fill on context fill it using kinetic node config
        this.fill (ctx);
        ctx.closePath ();
      });

      this.kineticNode.getLayer ().draw ();
    },

    // renders in the sequencer view
    render : function () {
      return this;
    },

    dragStopped : function (e) {
      this.model.set ({
        source_offset : Claw.Helpers.pxToSec (e.shape.getX())
      });
    }
  });
});