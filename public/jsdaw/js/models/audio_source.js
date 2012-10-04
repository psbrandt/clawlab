define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone, TrackCollection, Track) {
  var AudioSource = Backbone.Model.extend ({

    defaults : {
      previewing : false,
      bufferLoaded : false
    },

    initialize : function (data) {
      self = this;
    },

    upload : function () {
      // Return if we don't have to upload it
      if (!this.uploader) return;
      // Send fileupload with model's file
      this.uploader.fileupload ('send', { 
        files: [this.get ('file')], 
        url: this.collection.url,
        formData : { "audio_source[id]" : this.id }
      }).success (_.bind (this.uploadSuccess, this));
      var self = this;
      this.uploader.bind ("fileuploadprogress", function (e, data) {
        self.uploadProgress (data);
      });
    },

    uploadSuccess : function (data) {
      this.set (data)
      this.trigger ("uploadSuccess");
    },

    uploadProgress : function (data) {
      this.trigger ("uploadProgress", parseInt(data.loaded / data.total * 100, 10));
    }
    
  });

  return AudioSource;
});