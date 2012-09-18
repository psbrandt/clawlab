/**
 * The library view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/library.html",
  "views/audio_source_view"
], function($, _, Backbone, libraryTemplate, AudioSourceView) {
  return Backbone.View.extend ({
    
    template : _.template (libraryTemplate),

    events : {
      "dragover #dropzone" : "handleDragOver", 
      "drop #dropzone"     : "handleFileSelect"
    },

    initialize : function () {
      // listen when an audioSources is added
      this.collection.bind ("add", this.addAudioSource);
    },

    render : function () {
      $(this.el).html (this.template ());

      //render audio sources
      this.collection.each (this.addAudioSource);
      
      return this;
    },

    addAudioSource : function (audioSourceModel) {
      $("#audio-source-list", this.el).append (
        new AudioSourceView ({ 
          model : audioSourceModel
        }).render().el
      );
    },

    handleDragOver : function ($e) {
      $e.stopPropagation ();
      $e.preventDefault ();
      $e.originalEvent.dataTransfer.dropEffect = "copy";
    },

    handleFileSelect : function ($e) {
      $e.stopPropagation ();
      $e.preventDefault ();
      var files = $e.originalEvent.dataTransfer.files; // FileList object.
      // files is a FileList of File objects. List some properties.
      var output = [];
      for (var i = 0, f; f = files[i]; i++) {
        this.collection.addFromFile (f);
      }
    },

    // Not used ATM
    uploadFile : function (file) {
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress',function(ev){
        console.log((ev.loaded/ev.total)+'%');
      }, false);
      xhr.onreadystatechange = function(e){
        
        // Blah blah blah, you know how to make AJAX requests
      };
      xhr.open('POST', "audio_sources", true);
      var data = new FormData();
      data.append('audio_source[audio]', file);
      data.append('authenticity_token', window.authenticityToken);
      xhr.send(data);
    }
  });
});