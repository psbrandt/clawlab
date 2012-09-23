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

    events : {
      "click .remove-btn" : "removeClicked",
      "click .upload-btn" : "uploadClicked",
      "click .play-stop-btn"   : "playStopClicked"
    },

    initialize : function () {
      this.model.on ("destroy", this.remove, this);
      this.model.on ("bufferLoaded", this.bufferLoaded, this);
      this.model.on ("bufferProgress", this.bufferProgressed, this);
      this.playing = false;
    },

    render : function () {
      var data = {
        audioFilename : this.model.get ("audio_filename"),
        notUploaded : typeof this.model.uploader != "undefined",
        bufferLoaded : this.model.get ("bufferLoaded")
      }

      $(this.el).html (this.template (data));

      if(!this.model.isNew())
        $(this.el).find('.upload-btn').remove()

      return this;
    },

    bufferProgressed : function (complete) {
      this.$el.find (".bar").width (complete + "%");
    },

    bufferLoaded : function () {
      this.setDraggable ();
      this.$el.find (".bar").slideUp ();
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

    playStopClicked : function () {
      Claw.Player.playAudioSource (this.model.get("id"));
    },

    uploadClicked : function () {
      // Named handler so we can unbind it with no side-effects
      var onModelUploaded = _.bind (function() {
        // Unbind so it is only triggered once
        this.model.off('change', onModelUploaded);
        if(!this.model.isNew())
          $(this.el).find('.upload-btn').remove();
      }, this);

      this.model.on('change', onModelUploaded);
      this.model.upload()
    }
  });
});