/**
 * An audio source view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/audio_source.html",
  "helpers/form_helper"
  // "fileupload/jquery.iframe-transport",
  // "fileupload/jquery.fileupload"
], function($, _, Backbone, audioSourceTemplate, Form) {
  return Backbone.View.extend ({

    template : _.template (audioSourceTemplate),
    tagName : "li",

    events : {
      "click .remove-btn" : "removeClicked",
      "click .upload-btn" : "uploadClicked"
    },

    initialize : function () {
      this.model.on ("destroy", this.remove, this);
    },

    render : function () {
      var data = {
        audio_filename : this.model.get ("audio_filename")
      }
      $(this.el).html (this.template (data));

      return this;
    },

    removeClicked : function () {
      this.model.destroy ();
    },

    uploadClicked : function () {
      $(this.el).append(
        Form.createForm('#', 'put', $.proxy(function($form) {
          return $form.append(
            Form.createInput('file', 'audio_source[audio]', this.model.get ("file"), { 'class': 'audio-source-upload-field' })
          );
        }, this))
      );

      console.log("Need to upload file", this.model.get ("file"));
    }
  });
});