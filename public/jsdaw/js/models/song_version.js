define([
  "jquery",
  "underscore",
  "backbone",
  "collections/track_collection",
  "models/track"
], function($, _, Backbone, TrackCollection, Track) {
  var SongVersion = Backbone.Model.extend ({

    urlRoot : "/song_versions",

    initialize : function (data) {
      // initializing an array of TrackModel from JSON data
      var trackModels = _.map(data.tracks, function (json_track) { 
        return new Track (json_track);
      });

      this.tracks = new TrackCollection (trackModels);

    },

    // Create a new track in song version and save it
    addTrack : function () {
      //create a new track model
      var t = new Track ();
      //set the parent collection so the url is correct
      t.collection = this.tracks

      //persist the track
      if (t.save()) {
	//add it to the song version track collection
	this.tracks.add(t);
      };
    }
    
  });

  return SongVersion;
});