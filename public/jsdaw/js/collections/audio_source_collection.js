define([
  "jquery",
  "underscore",
  "backbone",
  "models/audio_source"
], function($, _, Backbone, AudioSourceModel) {

  return Backbone.Collection.extend ({
    model : AudioSourceModel,
    url : "audio_sources",

    /**
     * Take a File and add a new AudioSource to collection
     */
    addFromFile : function (file) {
      var src = new AudioSourceModel ({
        file : file,
        audio_filename : file.name
      });
      src.collection = this;

      this.add (src);
    }
  });

});