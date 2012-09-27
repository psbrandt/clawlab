/**
 * An audio source view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/audio_source.html",
  "helpers/form_helper",
  // jquery plugins at the end
  "jqueryui"
], function($, _, Backbone, audioSourceTemplate, Form) {
  return Backbone.View.extend ({

    template : _.template (audioSourceTemplate),
    tagName : "li",
    className : "audio-source",

    events : {
      "click .remove-btn" : "removeClicked",
      "click .upload-btn" : "uploadClicked",
      "click .preview-btn": "previewClicked"
    },

    initialize : function () {
      this.model.on ("destroy", this.remove, this);
      this.model.on ("change:bufferLoaded", this.bufferLoaded, this);
      this.model.on ("bufferProgress", this.bufferProgressed, this);
      this.model.on ("change:previewing", this.previewingChanged, this);
      this.playing = false;
    },

    render : function () {
      var data = {
        audioFilename : this.model.get ("audio_filename"),
        uploaded : this.model.uploader == undefined,
        bufferLoaded : this.model.get ("bufferLoaded"),
        previewing : this.model.get ("previewing")
      }

      this.$el.html (this.template (data));

      return this;
    },

    bufferProgressed : function (complete) {
      this.$el.find (".buffer-bar").width (complete + "%");
    },

    bufferLoaded : function (model, bufferLoaded) {
      this.setDraggable ();
      this.$el.find (".buffer-bar").slideUp ();
    },

    setDraggable : function () {
      this.$el.draggable ({
        revert : "invalid",
        revertDuration : 100,
        helper : "clone"
      });
    },
    
    removeClicked : function () {
      this.model.destroy ();
    },

    previewClicked : function () {
      if (this.$el.find (".preview-btn").hasClass ("icon-play"))
        Claw.Player.startAudioSourcePreview (this.model);
      else
        Claw.Player.stopAudioSourcePreview (this.model);
    },

    previewingChanged : function (model, previewing) {
      this.$el.find (".preview-btn").
        toggleClass ("icon-stop", previewing).
        toggleClass ("icon-play", !previewing)
    },

    uploadClicked : function () {
      // Named handler so we can unbind it with no side-effects
      var onModelUploaded = _.bind (function() {
        // Unbind so it is only triggered once
        this.model.off('change', onModelUploaded);
        if(!this.model.isNew())
          this.$el.find('.upload-btn').remove();
      }, this);

      this.model.on('change', onModelUploaded);
      this.model.upload()
    }
  });
});