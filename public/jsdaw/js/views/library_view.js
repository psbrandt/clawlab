/**
 * The library view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "views/audio_source_view",
  "text!templates/library.html",
  "text!templates/library_menu.html",
  "text!templates/dropzone.html",
  "fileupload/jquery.fileupload",
  "fileupload/jquery.iframe-transport"
], function($, _, Backbone, AudioSourceView, libraryTemplate, 
            libraryMenuTemplate, dropzoneTemplate) {
  return Backbone.View.extend ({

    className    : "tab-pane active",
    id           : "library",
    template     : _.template (libraryTemplate),
    menuTemplate : _.template (libraryMenuTemplate),

    events : {
      "dragover .dropzone" : "handleDragOver"
    },

    initialize : function () {
      // listen when an audioSources is added
      this.collection.bind ("add", this.addAudioSource, this);
      this.$elMenu = $("<li></li>"); 
      this.elMenu  = this.$elMenu[0];
    },

    render : function () {
      this.$elMenu.html (this.menuTemplate ());
      this.$el.html (this.template ());
      this.$el.find (".dropzone").html (_.template (dropzoneTemplate, {
        text : "Drop audio files<br />from your computer<br />(wav or mp3)"
      }));

      //render audio sources
      this.collection.each (this.addAudioSource, this);

      // Initialize fileupload
      this.$fileupload = this.$el.find('input:file.file-upload-field')
      // Listen drop or add
      this.$fileupload.fileupload({
        dropZone: this.$el.find('.dropzone'),
        fileInput: null,
        add: _.bind(this.handleFileSelect, this),
        dataType: 'json'
      })
      return this;
    },

    addAudioSource : function (audioSourceModel) {
      var audioSourceView = new AudioSourceView ({ 
        model : audioSourceModel,
        id : audioSourceModel.get("id")
      }).render();
      this.$el.find ("#audio-source-list").append (
          audioSourceView.el
      );
    },

    handleDragOver : function ($e) {
      $e.stopPropagation ();
      $e.preventDefault ();
      $e.originalEvent.dataTransfer.dropEffect = "copy";
    },

    // TODO: Check if we can listen to view events directly so we don't rely on
    // model's upload event triggering
    //
    // NOTE : Only compatible with XHR uploads because of drop, must try to
    // adapt adding a file upload button, even for ergonomics purposes
    handleFileSelect : function ($e, data) {
      for (var i = 0, f; f = data.files[i]; i++) {
        this.collection.addFromFile (f, this.$fileupload);
      }
    }
  });
});