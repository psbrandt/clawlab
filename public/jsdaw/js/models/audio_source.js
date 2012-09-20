define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone, TrackCollection, Track) {
  var AudioSource = Backbone.Model.extend ({

    idAttribute : "_id",

    defaults : {

    },

    initialize : function (data) {
    },

    upload : function () {
      // Return if we don't have to upload it
      if (!this.isNew() || !this.uploader) return;
      // Send fileupload with model's file
      this.uploader.fileupload ('send', { files: [this.get ('file')], url: this.url ()})
        .success (_.bind (this.uploadSuccess, this));
    },

    uploadSuccess : function (data) {
      this.set (data)
    }
  });

  return AudioSource;
});