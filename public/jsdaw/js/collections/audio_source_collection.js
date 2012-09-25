define([
  "jquery",
  "underscore",
  "backbone",
  "models/audio_source",
  "helpers/audio_source_loader"
], function($, _, Backbone, AudioSourceModel, AudioSourceLoader, Player) {

  return Backbone.Collection.extend ({
    model : AudioSourceModel,
    url : "audio_sources",

    /**
     * Take a File and add a new AudioSource to collection
     */
    addFromFile : function (file, uploader) {
      var src = new AudioSourceModel ({
        file : file,
        audio_filename : file.name
      });
      src.uploader = uploader;
      src.collection = this;
      var self = this;
      AudioSourceLoader.loadFromFile (file, Claw.Player.context, function (audioBuffer) {
        src.buffer = audioBuffer;
        self.add (src);
      });
    }
  });

});