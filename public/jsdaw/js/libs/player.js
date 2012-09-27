/**
 * Audio player object
 *
 * @file        player.js
 * @authors     Jan Myler <honza.myler[at]gmail.com>, Gabriel Cardoso
 * @copyright   Copyright 2012, Jan Myler (http://janmyler.com)
 * @license     MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 */

define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/alert_modal.html'
], function($, _, Backbone, AlertT) {
  return Backbone.Model.extend ({
    initialize : function (songVersionModel, onloadCallback) {
      // browser compatibility test
      if (typeof webkitAudioContext === 'undefined' && typeof AudioContext === 'undefined') {
        var tpl = (_.template(AlertT))({
          message: 'Your browser is not supported yet, try using Google Chrome.'
        });
        $(tpl).modal();   
      } else
        this.context = new webkitAudioContext || new AudioContext;
      
      this.buffers    = {};
      this.trackNodes = {};
      this.clipNodes  = {};
      this.clips      = [];
      this.playingSources = {};

      // to store an audio source beeing previewed
      this.sourcePreview = { model : undefined, source : undefined}; 

      this.playing    = false;
      this.startTime;
      this.playbackFrom = 0;
      this.model = songVersionModel;

      var self = this;
      var loadCount = 0;
      this.model.audioSources.each (function (audioSource) {
        AudioSourceLoader.loadFromUrl (
          audioSource.get ("url"),
          self.context,
          function (audioBuffer) {
            self.buffers[audioSource.get("id")] = audioBuffer;
            audioSource.trigger ("bufferLoaded");
            if (++loadCount == self.model.audioSources.length) 
              self.model.set ("readyToPlay", true);
          },
          { onprogress : function (e) {
            var complete = e.position * 100 / e.totalSize;
            audioSource.trigger ("bufferProgress", complete);
          }}
        );
      });

      this.model.tracks.each (function (track) {
        self.addTrack (track);
      });

      this.model.on ("play" , this.playNotes, this);
      this.model.on ("stop", this.stopNotes, this);
      this.model.tracks.on ("add", this.addTrack, this);
      this.model.tracks.on ("remove", this.releaseTrack, this);
      this.model.audioSources.on ("add", function (audioSource) { console.log ("aads")});
    },

    startAudioSourcePreview : function (audioSource) {
      try {
        // stop possible playing source
        this.sourcePreview.source.noteOff (0);
        this.sourcePreview.model.set ("previewing", false);
      } catch (e) { }
      var source = this.context.createBufferSource ();
      source.buffer = this.buffers[audioSource.id]
      source.connect (this.context.destination);
      source.noteOn(0);
      this.sourcePreview = {model : audioSource, source : source};
      audioSource.set ("previewing", true);
    },

    stopAudioSourcePreview : function (audioSource) {
      this.sourcePreview.source.noteOff (0);
      this.sourcePreview = { model : undefined, source : undefined }
      audioSource.set ("previewing", false);
    },

    addClip : function (clip, track) {
      //this.clips.push (clip);
      var clipGainNode = this.context.createGainNode ();
      this.clipNodes[clip.id] = clipGainNode
      clipGainNode.connect (this.trackNodes[track.id]);

      clip.on ("change:source_offset", this.sourceOffsetChanged, this);
    },

    addTrack : function(track) {
      if (typeof this.trackNodes[track.id] === 'undefined') {
        var trackGainNode = this.context.createGainNode();
        this.trackNodes[track.id] = trackGainNode;
        trackGainNode.connect(this.context.destination);

        var self = this;
        track.on ("change:muted", function (track, muted) { 
          muted ? this.muteTrack (track) : this.unmuteTrack (track)
        }, this);
        //track.on ("change:volume", this.setTrackVolume, this);
        track.clips.on ("add", function (clip) { self.addClip (clip, track) });

        track.clips.each (function (clip) {
          self.addClip (clip, track);
        });
      }
    },

    muteTrack : function (track) {
      this.trackNodes[track.id].gain.value = 0;
    },

    unmuteTrack : function (track) {
      this.trackNodes[track.id].gain.value = 1; //FIXME set with volume
    },

    releaseTrack : function(track) {
      this.trackNodes[track.id].disconnect();
      delete this.trackNodes[track.id];
    },

    sourceOffsetChanged : function (clip, offset) {
      if (this.playing) {
        var source = this.playingSources [clip.id];
        source.noteOff (0);
        var end = source.buffer.duration + offset;
        if (end > this.context.currentTime - this.startTime + this.playbackFrom)
          this.playNote (clip, clip.get ("source_offset") + this.startTime 
                         - this.playbackFrom);
      }
    },

    schedule : function () {
      this.model.set ("playingAt", 
                      this.context.currentTime - this.startTime + this.playbackFrom);
      
      var self = this;
      this.timeoutId = setTimeout (function () {
        self.schedule ();
      });
    },

    /* Play a clip at a exact time relative to this.context.currentTime */
    playNote : function (clip, time) {
      var source = this.context.createBufferSource ();
      source.buffer = this.buffers [clip.get ("audio_source_id")];
      source.loop = false;
      source.connect (this.clipNodes [clip.id]);
      if (time < this.startTime) {
        var offset = this.startTime - time;
        source.noteGrainOn (0, offset, source.buffer.duration - offset);
      }
      else
        source.noteOn (time);

      this.playingSources [clip.id] = source;
    },

    /* play all clips by getting the current position in the model. All 
     * bufferSources are recorded in this.playingSources */
    playNotes : function () {
      if (this.playing) return;
      this.playing = true;
      this.startTime = this.context.currentTime;
      
      this.playbackFrom = this.model.get ("playingAt");

      var self = this;
      _.each (this.model.clips (), function (clip) {
        var end = self.buffers [clip.get ("audio_source_id")].duration +
          clip.get ("source_offset");
        if (end > self.playbackFrom)
          self.playNote (clip, self.startTime + clip.get ("source_offset") - self.playbackFrom);
      });
      this.model.set ("playing", true);
      this.schedule ();
    },

    stopNotes : function () {
      clearTimeout (this.timeoutId);
      this.playing = false;
      this.model.set ("playing", false);
      _.each (this.playingSources, function (source) { source.noteOff (0) });
      this.playingSources = {};
    },

    volumeChange : function(volume, cid) {
      this.gainNodes[cid].gain.value = volume;
    }

  });
});