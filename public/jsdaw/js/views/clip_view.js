/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "models/clip",
  "text!templates/clip.html",
  "text!templates/clip_edit.html",
  "libs/waveform",
  "models/audio_source",
  "jqueryui"
], function($, _, Backbone, Clip, clipTemplate, editTemplate, Waveform,
      AudioSource) {
  return Backbone.View.extend ({

    template : _.template (clipTemplate),

    className : "clip",

    events : {
      "dragstop"      : "dragStopped",
      "dragstart"     : "dragStarted",
      "drag"          : "dragging",
      "selected"      : "selected",
      "unselected"    : "unselected",
      "dblclick"      : "dblClicked",
      "click"         : "clicked",
      "resizestart"   : "resizeStart",
      "resizestop"    : "resizeStop",
      "resize"        : "resizing",
      "mousedown"     : "mouseDown"
    },

    initialize : function () {
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );

      this.model.on ("destroy", this.remove, this);

      // If the audio source was not found initialize an empty one
      if (typeof this.audioSource === 'undefined') {
        this.audioSource = new AudioSource ();
      }
      this.buffer = Claw.Player.buffers[this.audioSource.get("id")];

      this.audioSource.on ("change:bufferLoaded", this.bufferLoaded, this);
      this.model.on (
        "change:begin_offset change:source_offset change:end_offset",
        this.render, this
      );
    },

    render : function () {
      var data = {}
      data.filename = this.audioSource.get ("audio_filename")

      this.$el.css ('display', 'none').html (this.template (data));

      this.$canvas = this.$el.find('canvas')

      // when the clip starts in the song
      this.offset = this.model.get ("source_offset") + this.model.get ("begin_offset");

      this.left = Claw.Helpers.secToPx (this.offset);


      // the length of the clip in seconds
      this.sourceDuration = this.audioSource.get ('length');

      this.duration = this.sourceDuration - this.model.get ("begin_offset") - this.model.get ("end_offset");

      // width in px
      this.width = Claw.Helpers.secToPx (this.sourceDuration);

      this.display_width = Claw.Helpers.secToPx (this.duration);

      this.canvas_offset = - (Claw.Helpers.secToPx (this.model.get ("begin_offset")))
      // height in pixels
      var height = 59; //huh ..

      this.$el.css ({
        position : "absolute",
        width : this.display_width,
        left : this.left,
        display: 'block'
      });

      this.$canvas.attr ({
        width : this.width,
        height : height
      }).css({
        marginLeft: this.canvas_offset
      })

      // Render waveform
      if (this.buffer)
        this.drawWaveform ()
      else this.$canvas.css ({
        width : "100px",
      });

      // Destroy resizable if existing
      if (this.$el.hasClass('ui-resizable')) this.$el.resizable('destroy');

      this.$el.resizable ({ handles : "e, w", maxWidth : this.width });

      this.$el.draggable ({
        containment : "parent",
        scroll : true,
        scrollSensitivity : 40,
        axis : "x"
      });

      // Hack to remove position set to relative by ui-draggable
      this.$el.css ("position", "absolute");

      return this;
    },

    clicked : function (e) {
      if (e.altKey) {
        var time = Claw.Helpers.pxToSec (e.offsetX);

        var beginOffset = this.model.get ("begin_offset"),
            endOffset = this.model.get ("end_offset"),
            sourceOffset = this.model.get ("source_offset"),
            audioSourceId = this.model.get ("audio_source_id"),
            trackId = this.model.get ("track_id");

        var leftClip = new Clip ({
          audio_source_id : audioSourceId,
          source_offset : sourceOffset,
          begin_offset : beginOffset,
          end_offset : this.sourceDuration - time,
          track_id : trackId
        });

        var rightClip = new Clip ({
          audio_source_id : audioSourceId,
          source_offset : sourceOffset,
          begin_offset : time,
          end_offset : endOffset,
          track_id : trackId
        });

        leftClip.collection  = this.model.collection;
        rightClip.collection = this.model.collection;

        leftClip.save ({}, {
          wait : true, success : function () {
            //add it to the track clip collection
            leftClip.collection.add (leftClip);
          }
        });

        rightClip.save ({}, {
          wait : true, success : function () {
            //add it to the track clip collection
            rightClip.collection.add (rightClip);
          }
        });

        this.model.destroy ();
      }
    },

    remove : function () {
      this.$el.remove ();
    },

    selected : function (e, originalEvent, ui) {
      this.model.set ("selected", true);
    },

    unselected : function (e, originalEvent, ui) {
      this.model.set ("selected", false);
    },

    dblClicked : function () {
      var self = this;
      var modal = _.template (editTemplate, {
        begin_offset  : this.model.get("begin_offset"),
        end_offset    : this.model.get("end_offset"),
        source_offset : this.model.get("source_offset")
      });
      $(modal).modal({
        backdrop : false,
        keyboard : true
      }).on ("hidden", function () {$(this).remove ()})
        .find (".save-btn").on ("click", function () {
          self.model.set ({
            "begin_offset"  : parseFloat ($("input[name=begin_offset]").val ()),
            "end_offset"    : parseFloat ($("input[name=end_offset]").val ()),
            "source_offset" : parseFloat ($("input[name=source_offset]").val ())
          });
          self.model.save ();
          return false;
        })
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
      var dataArray = this.buffer.getChannelData (0);
      new Waveform ({
        canvas : this.$canvas[0],
        data :  dataArray
        // data : dataArray.subarray (
        //   this.model.get ("begin_offset") * this.buffer.sampleRate,
        //   (this.endOffset <= 0) ? dataArray.length : -this.endOffset * this.buffer.sampleRate
        // )
      });
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
        var prevOffset = $(el).data ("offset");
        $(el).css ("left", prevOffset.left + dl);
        return true;
      });
    },

    dragStopped : function (e) {
      var pxOffset  = Claw.Helpers.snapPx (this.$el.position ().left);
      var offset = Claw.Helpers.pxToSec (pxOffset) - this.model.get ("begin_offset");
      this.$el.css ("left", pxOffset);
      _.each (this.alsoDrag, function (el) {
        $(el).trigger ("dragstop");
      })
      this.alsoDrag = [];
      if (this.model.get ("source_offset") != offset) {
        this.model.save ({
          source_offset : offset
        });
      }
    },


    /**
     *
     * Clip resize handling
     *
     */

    resizeStart: function(e, ui) {
      // If left resize ...
      if (ui.originalPosition.left != ui.position.left) {

      // If right resize
      } else if (ui.originalSize.width != ui.size.width) {

      }

    },

    resizeStop: function(e, ui) {
      // Force last resize ...
      this.resizing (e, ui);
      // If resized from left
      var marginLeft = Claw.Helpers.floatFromCss (this.$canvas.css('marginLeft'));
      var left_offset = Claw.Helpers.pxToSec (-marginLeft);

      if (this.model.get ("begin_offset") != left_offset) {
        this.model.save ({
          begin_offset : left_offset
        });
      }

      // If resized from the right
      var width = Claw.Helpers.floatFromCss (this.$el.css('width'));
      var right_offset = this.sourceDuration - (Claw.Helpers.pxToSec(width) + this.model.get ("begin_offset"));

      if (this.model.get ("end_offset") != right_offset) {
        this.model.save ({
          end_offset : right_offset
        });
      }
    },

    resizing: function(e, ui) {
      // If we're moving from left to right
      if (ui.originalPosition.left != ui.position.left) {
        this.$canvas.css('marginLeft', (this.canvas_offset + (ui.originalPosition.left - ui.position.left)))
      } else if (ui.originalSize.width != ui.size.width) {

      }

    },

    mouseDown : function (e, ui) {
      this.$el.addClass("ui-selected");
      this.$el.trigger("selected");
    }

  });
});