/**
 * An audio source view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/audio_source.html",
  // jquery plugins at the end
  "jqueryui"
], function($, _, Backbone, audioSourceTemplate) {
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
        revert : true,
        revertDuration : 100,
        zIndex : 40000
      });
      
      return this;
    },

    removeClicked : function () {
      this.model.destroy ();
    },

    uploadClicked : function () {
      console.log ("Need to upload file", this.model.get ("file"));
    }
  });
});