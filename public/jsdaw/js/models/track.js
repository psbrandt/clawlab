define([
  "jquery",
  "underscore",
  "backbone",
  "models/clip",
  "collections/clip_collection"
], function($, _, Backbone, Clip, ClipCollection) {
  var TrackModel = Backbone.Model.extend ({
    
    //Setting the id to match Mongoid ids
    idAttribute : "_id", 

    defaults : {
      name : "New track",
      volume : 0,
      height : 75,
      muted : false,
      solo  : false
    },

    initialize : function (data) {
      var clipModels = [];
      if (data)
        clipModels = _.map (data.clips, function (json_clip) {
          json_clip.track_id = data._id;
          return new Clip (json_clip);
        });
      this.clips = new ClipCollection (clipModels);
    },

    addClip : function (audioSourceId, offset) {
      //create a new clip model
      var c = new Clip ({
        audio_source_id : audioSourceId,
        source_offset : offset,
        track_id : this.id
      });
      //set the parent collection so the url is correct
      c.collection = this.clips;
      var self = this;
      //persist the clip
      c.save({}, {
        wait : true, success : function () {
	  //add it to the track clip collection
          self.clips.add (c);
        }
      });
    }
  });
  return TrackModel;
});