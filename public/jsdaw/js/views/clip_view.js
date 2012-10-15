/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/clip.html",
  "text!templates/clip_edit.html",
  "libs/waveform",
  "models/audio_source",
  "jqueryui"
], function($, _, Backbone, clipTemplate, editTemplate, Waveform, AudioSource) {
  return Backbone.View.extend ({

    template : _.template (clipTemplate),

    className : "clip",

    events : {
      "dragstop"   : "dragStopped",
      "dragstart"  : "dragStarted",
      "drag"       : "dragging",
      "selected"   : "selected",
      "unselected" : "unselected",
      "dblclick"   : "dblClicked"
    },

    initialize : function () {
      this.audioSource = Claw.Player.model.audioSources.get (
        this.model.get("audio_source_id")
      );

      this.model.on ("destroy", this.remove, this);

      // If the audio source was not found initialize an empty one
      if (this.audioSource == undefined) {
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
      this.$el.html (this.template (data));

      this.$el.draggable ({
        containment : "parent",
        scroll : true,
        scrollSensitivity : 40,
        axis : "x"
      });
      // Hack to remove position set to relative by ui-draggable
      this.$el.css ("position", "absolute");

      if (this.buffer) this.drawWaveform ()
      else this.$el.find ("canvas").css ({
        width : "100px",
      });

      return this;
    },

    remove : function () {
      this.$el.remove ();
    },

    selected : function (e, ui) {
      this.model.set ("selected", true);
    },

    unselected : function () {
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
      // where to start in the buffer in seconds
      var beginOffset = this.model.get ("begin_offset");
      // where to end in the buffer in seconds
      var endOffset = this.model.get ("end_offset");
      // when the clip starts in the song
      var offset = this.model.get("source_offset") + beginOffset;

      // the length of the clip in seconds
      var length = this.buffer.duration - beginOffset - endOffset;
      // width in px
      var width = Claw.Helpers.secToPx (length);
      // height in pixels
      var height = 75; //huh ..

      this.$el.css ({
        width : width,
        left : Claw.Helpers.secToPx (offset)
      }).find ("canvas").attr ({
        width : width,
        height : height
      })

      var dataArray = this.buffer.getChannelData (0);
      new Waveform ({
        canvas : this.$el.find ("canvas")[0],
        data : dataArray.subarray (
          beginOffset * this.buffer.sampleRate, 
          (endOffset <= 0) ? dataArray.length : -endOffset * this.buffer.sampleRate
        )
      });

      // FIXME ! only works after re-rendering (after zoomIn for example)
      // this.$el.resizable ({
      //   handles : "e, w",
      //   maxWidth : Claw.Helpers.secToPx (length)
      // });
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
    }

  });
});