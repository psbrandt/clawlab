/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "waveform"
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
      this.kineticNode = new Kinetic.Rect ({
        x : offset,
        height : 75,
        width : this.buffer ? Claw.Helpers.secToPx (this.buffer.duration) : 0,
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
          colorStops : [0, "rgb(76, 76, 76)", 0.5, "rgba(76, 76, 76, 0.5)", 1, "rgb(76, 76, 76)"]
        },
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
      var width = Claw.Helpers.secToPx (this.buffer.duration);
      var offset = Claw.Helpers.secToPx (this.model.get("source_offset"));
      this.kineticNode.setWidth (width);
      // var self = this;
      // var shape = new Kinetic.Shape ({
      //   drawFunc : function (context) {
      //     self.drawSound (context, width, 75, buffer, offset);
      //   }
      // })
      // shape.toImage ({
      //   width : width, 
      //   height : 75,
      //   callback : function (img) {
      //     console.log (self.kineticNode);
      //     self.kineticNode.setImage (img);
      //   }
      // });
    },

    // renders in the sequencer view
    render : function () {
      return this;
    },

    dragStopped : function (e) {
      this.model.set ({
        source_offset : Claw.Helpers.pxToSec (e.shape.getX())
      });
    },

    drawSound : function(ctx, width, height, audioBuffer, offset) {
      var subpixels = 5,
      frame = audioBuffer.length / Claw.Helpers.secToPx(audioBuffer.duration) / subpixels,
      ch1   = audioBuffer.getChannelData(0),
      ch2   = undefined,
      mid   = height / 2;  // maximum amplitude height
      val   = 0,
      posX  = offset,
      i     = (offset * frame * subpixels) % audioBuffer.length;

      if (audioBuffer.numberOfChannels > 1)
        ch2 = audioBuffer.getChannelData(1);
            
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(posX, mid);
            
      // draws just a channel 1 data (dummy version)
      while(posX <= width) {
        val = ch1[Math.floor(i)];
        // val = this.frameRMS(ch1, Math.floor(i), frame);
                
        // if (ch2)
        //     val = (val + ch2[Math.floor(i)]) / 2;

        i = (i + frame) % audioBuffer.length;

        ctx.lineTo(posX, (val * mid) + mid); // FIXME: plus and minus signs must be switched [+v,-^] to [+^,-v]
                
        // draws splitting lines (start and end of the clip)
        if (i >= 0 && i <= frame) {
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillRect(posX, 0, 1, 10);
          ctx.fillRect(posX, height - 10, 1, 10);
          ctx.globalCompositeOperation = 'source-over';
        }

        posX += 1 / subpixels;
      }

      ctx.stroke();
    }

  });
});