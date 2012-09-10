define([
  "jquery",
  "underscore",
  "backbone",
  "collections/track_collection",
  "models/track"
], function($, _, Backbone, TrackCollection, Track) {
  var SongVersion = Backbone.Model.extend ({
    initialize : function (data) {
      // initializing an array of TrackModel from JSON data
      var trackModels = _.map(data.tracks, function (json_track) { 
        new Track (json_track) 
      });

      this.tracks = new TrackCollection (trackModels);
    }
    
  });

  return SongVersion;
});