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
      this.soloedTrack  = undefined; //the track playing solo
      this.playingSources = {};

      // to store an audio source beeing previewed
      this.sourcePreview = { model : undefined, source : undefined}; 

      this.playing = false;
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
            audioSource.set ("bufferLoaded", true);
            if (++loadCount == self.model.audioSources.length) 
              self.model.set ("readyToPlay", true);
          },
          { onprogress : function (e) {
            var complete = e.loaded * 100 / e.total;
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
      this.model.audioSources.on ("add", this.audioSourceAdded, this);
    },

    audioSourceAdded : function (audioSource) {
      var self = this;
      AudioSourceLoader.loadFromFile (
        audioSource.get ("file"),
        self.context,
        function (audioBuffer) {
          self.buffers[audioSource.get("id")] = audioBuffer;
          audioSource.set ("bufferLoaded", true)
          // set ready to play if it is the first source
          self.model.set ("readyToPlay", true);
        },
        { onprogress : function (e) {
          var complete = e.loaded * 100 / e.total;
          audioSource.trigger ("bufferProgress", complete);
        }}
      );
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

    addClip : function (clip) {
      //this.clips.push (clip);
      var clipGainNode = this.context.createGainNode ();
      this.clipNodes[clip.id] = clipGainNode
      clipGainNode.connect (this.trackNodes[clip.get ("track_id")]);

      clip.on ("change:source_offset", this.sourceOffsetChanged, this);
      clip.on ("change:begin_offset",  this.beginOffsetChanged,  this);
      clip.on ("change:end_offset",    this.endOffsetChanged,    this);
    },

    addTrack : function(track) {
      if (typeof this.trackNodes[track.id] === 'undefined') {
        var trackGainNode = this.context.createGainNode();
        this.trackNodes[track.id] = trackGainNode;
        trackGainNode.connect(this.context.destination);

        track.on ("change:muted", function (track, muted) { 
          muted ? this.muteTrack (track) : this.unmuteTrack (track)
        }, this);
        track.on ("change:solo", function (track, solo) {
          solo ? this.soloTrack (track) : this.unsoloTrack (track);
        }, this)
        //track.on ("change:volume", this.setTrackVolume, this);
        track.clips.on ("add", this.addClip, this);
        track.clips.on ("remove", this.releaseClip, this);
        track.clips.each (this.addClip, this);
      }
    },

    muteTrack : function (track) {
      this.trackNodes[track.id].gain.value = 0;
    },

    unmuteTrack : function (track) {
      this.trackNodes[track.id].gain.value = 1; //FIXME set with volume
    },

    soloTrack : function (track) {
      if (this.soloedTrack)
        this.soloedTrack.set ("solo", false);
      this.model.tracks.each (function (t) {
        if (t != track) {
          this.muteTrack (t)// mute all tracks
        }      
      }, this);
      this.unmuteTrack (track);
      this.soloedTrack = track;
    },

    unsoloTrack : function (track) {
      this.model.tracks.each (function (t) {
        if (!t.get ("mute")) this.unmuteTrack (t);
      }, this);
      this.soloedTrack = undefined;
    },

    releaseTrack : function(track) {
      this.trackNodes[track.id].disconnect();
      delete this.trackNodes[track.id];
    },

    releaseClip : function (clip) {
      if (!this.playing) return;
      this.playingSources [clip.id].noteOff (0);
      delete this.playingSources [clip.id];
    },

    sourceOffsetChanged : function (clip, offset) {
      if (this.playing) {
        var source = this.playingSources [clip.id];
        source.noteOff (0);
        var end = source.buffer.duration + offset;
        if (end > this.context.currentTime - this.startTime + this.playbackFrom)
          this.playNote (clip, offset + this.startTime - this.playbackFrom);
      }
    },

    beginOffsetChanged : function (clip, offset) {
      if (this.playing) {
      }
    },

    sourceOffsetChanged : function (clip, offset) {
      if (this.playing) {
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
      var sourceOffset = clip.get ("source_offset"),
      beginOffset = clip.get ("begin_offset"),
      endOffset = clip.get ("end_offset")
      var length = source.buffer.duration - beginOffset - endOffset
      if (time < this.startTime) {
        var offset = this.startTime - time;
        source.noteGrainOn (
          0,
          beginOffset + offset,
          length - offset
        );
      }
      else
        source.noteGrainOn (time, beginOffset, length);

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
        var buffer = self.buffers [clip.get ("audio_source_id")],
        sourceOffset = clip.get ("source_offset"),
        beginOffset  = clip.get ("begin_offset"),
        endOffset    = clip.get ("end_offset");
        if (buffer == undefined) return;
        var end = buffer.duration + sourceOffset - endOffset;
        if (end > self.playbackFrom)
          self.playNote (clip, self.startTime + 
                         sourceOffset + beginOffset - self.playbackFrom);
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