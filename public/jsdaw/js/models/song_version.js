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

    defaults : {
      playingAt : 0,
      playing : false,
      exporting : false,
      timelineHeight : 20,
      readyToPlay : false,
      scale : 40, // in px per beat
      rightBarVisible : true,
      scrollLeft : 0,
      scrollTop  : 0,
      startLoop  : 0,
      endLoop    : 0,
      looping    : false
    },

    validate : function (attrs) {
      if (attrs.endLoop < attrs.startLoop) return "can't end before it starts";
    },

    initialize : function (data) {
      // initializing an array of TrackModel from JSON data
      this.tracks = _.reduce (data.tracks, function (coll, json_track) {
        json_track.index = coll.getIndexCount ();
        return coll.add (new Track (json_track));
      }, new TrackCollection ());

      var audioSourceModels = _.map (data.audio_sources, function (json_source) {
        return new AudioSource (json_source);
      });
      this.audioSources = new AudioSourceCollection (audioSourceModels);
    },

    zoomIn : function () {
      Claw.Helpers.pxPerBeat += 5;
      this.set ("scale", this.get ("scale") + 5);
    },

    zoomOut : function () {
      var scale = Math.max (5, this.get ("scale") - 5);
      Claw.Helpers.pxPerBeat = scale;
      this.set ("scale", scale);
    },

    clips : function () {
      return this.tracks.reduce (function (acc, track) {
        return acc.concat (track.clips.toArray()) }, new Array ());
    },

    play : function () {
      this.trigger ("play");
    },

    stop : function () {
      this.set ("playingAt", 0);
      this.trigger ("stop");
    },

    pause : function () {
      this.trigger ("stop");
    },

    exportMaster : function () {
      this.trigger ("exportMaster");
    },

    deleteSelectedClips : function () {
      this.tracks.each (function (track) {
        track.clips.each (function (clip) {
          if (clip.get("selected")) clip.destroy ();
        })
      });
    },

    // Create a new track in song version and save it
    addTrack : function (callback) {
      //create a new track model
      var t = new Track ();
      //set the parent collection so the url is correct
      t.collection = this.tracks

      var self = this;
      //persist the track
      t.save({}, {wait : true, success : function () {
	//add it to the song version track collection
        self.tracks.add(t);
        if (callback) callback (t);
      }});
    },

    fetchRootAction : function () {
      var self = this;
      $.get ("root_action", function (data) {
        self.set ("root_action", data);
      })
    },

    merge : function (song_version_id) {
      var self = this;
      $.ajax ({
        type : "PUT",
        url : "merge",
        data : {song_version_id : song_version_id }, 
        success : function (data) {
          // update model
        }
      });
    }
    
  });

  return SongVersion;
});