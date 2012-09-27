define([
  "jquery",
  "underscore",
  "backbone",
  "models/audio_source",
  "helpers/audio_source_loader",
  "helpers/object_id"
], function($, _, Backbone, AudioSourceModel, AudioSourceLoader, ObjectId) {

  return Backbone.Collection.extend ({
    model : AudioSourceModel,
    url : "audio_sources",

    /**
     * Take a File and add a new AudioSource to collection
     */
    addFromFile : function (file, uploader) {
      var src = new AudioSourceModel ({
        file : file,
        audio_filename : file.name,
        id : new ObjectId ().toString ()
      });
      src.uploader = uploader;
      src.collection = this;
      this.add (src);
    }
  });

});