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

      this.$el.draggable ({
        revert : "invalid",
        revertDuration : 100,
        helper : "clone"
      });
      
      if(!this.model.isNew())
        $(this.el).find('.upload-btn').remove()

      return this;
    },

    removeClicked : function () {
      this.model.destroy ();
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