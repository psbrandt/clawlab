define([
  "jquery",
  "underscore",
  "backbone",
  "collections/track_collection",
  "models/track",
  "collections/audio_source_collection",
  "models/audio_source"
], function($, _, Backbone, TrackCollection, Track, AudioSourceCollection, 
            AudioSource) {
  var SongVersion = Backbone.Model.extend ({

    urlRoot : "/song_versions",

    initialize : function (data) {
      // initializing an array of TrackModel from JSON data
      var trackModels = _.map(data.tracks, function (json_track) { 
        return new Track (json_track);
      });
      this.tracks = new TrackCollection (trackModels);

      var audioSourceModels = _.map (data.audio_sources, function (json_source) {
        return new AudioSource (json_source);
      });
      this.audioSources = new AudioSourceCollection (audioSourceModels);
    },

    // Create a new track in song version and save it
    addTrack : function () {
      //create a new track model
      var t = new Track ();
      //set the parent collection so the url is correct
      t.collection = this.tracks

      var self = this;
      //persist the track
      t.save({}, {wait : true, success : function () {
	//add it to the song version track collection
        self.tracks.add(t);
      }});
    },

    fetchRootAction : function () {
      var self = this;
      $.get ("root_action", function (data) {
        self.set ("root_action", data);
      })
    }

    
  });

  return SongVersion;
});