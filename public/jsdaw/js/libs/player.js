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
  'text!templates/alert_modal.html',
  'recorder'
], function($, _, Backbone, AlertT, Recorder) {
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

      // Create and connect the master gain node to context destination
      this.masterGainNode = this.context.createGainNode ();
      this.masterGainNode.connect (this.context.destination);

      this.buffers    = {};
      this.trackNodes = {};
      this.clipNodes  = {};
      this.clips      = [];
      this.soloedTrack  = null; // the track playing solo
      this.playingSources = {};

      // to store an audio source beeing previewed
      this.sourcePreview = { model : null, source : null};

      var self = this;
      this.model = songVersionModel;

      this.playing = false;
      this.exporting = false;
      // Create a new recorder object
      this.rec = new Recorder (this.masterGainNode, {
        workerPath : "/jsdaw/js/libs/recorderjs/recorderWorker.js",
        callback : function (blob) { self.model.trigger ("exported", blob) }
      })

      this.end; // to store the end time of the song
      this.startTime;
      this.playbackFrom = 0;

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
      this.model.on ("exportMaster", this.startExport, this);
      this.model.on ("cancelExport", this.cancelExport, this);
      this.model.tracks.on ("add", this.addTrack, this);
      this.model.tracks.on ("remove", this.releaseTrack, this);
      this.model.audioSources.on ("add", this.audioSourceAdded, this);
    },

    startExport : function (opts) {
      if (opts.region) {
	this.model.set ("playingAt", this.model.get ("regionBegin"));
        this.end = this.model.get ("regionEnd");
      } else {
  this.model.set ("playingAt", 0);
  this.end = null;
      }
      this.rec.clear  ();
      this.rec.record ();
      this.exporting = true;
      this.model.set ("exporting", true);
      this.playNotes ();
    },

    stopExport : function () {
      this.rec.stop ();
      this.exporting = false;
      this.rec.exportWAV ();
    },

    cancelExport : function () {
      this.rec.stop  ();
      this.rec.clear ();
      this.exporting = false;
    },

    audioSourceAdded : function (audioSource) {
      var self = this;
      AudioSourceLoader.loadFromFile (
        audioSource.get ("file"),
        self.context,
        function (audioBuffer) {
          self.buffers[audioSource.get("id")] = audioBuffer;
          audioSource.set ("bufferLoaded", true);
	  audioSource.set ("length", audioBuffer.duration);
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
      this.sourcePreview = { model : null, source : null }
      audioSource.set ("previewing", false);
    },

    addClip : function (clip) {
      var clipGainNode = this.context.createGainNode ();
      this.clipNodes[clip.id] = clipGainNode;
      clipGainNode.connect (this.trackNodes[clip.get ("track_id")]);

      clip.on ("change:source_offset", this.sourceOffsetChanged, this);
      clip.on ("change:begin_offset",  this.beginOffsetChanged,  this);
      clip.on ("change:end_offset",    this.endOffsetChanged,    this);
    },

    addTrack : function(track) {
      if (typeof this.trackNodes[track.id] === 'undefined') {
        var trackGainNode = this.context.createGainNode();
        trackGainNode.gain.value = track.get ("volume");
        this.trackNodes[track.id] = trackGainNode;
        trackGainNode.connect(this.masterGainNode);

        track.on ("change:volume", this.setTrackVolume, this);
        track.on ("change:muted", function (track, muted) {
          muted ? this.muteTrack (track) : this.unmuteTrack (track)
        }, this);
        track.on ("change:solo", function (track, solo) {
          solo ? this.soloTrack (track) : this.unsoloTrack (track);
        }, this)
        track.clips.on ("add", this.addClip, this);
        track.clips.on ("remove", this.releaseClip, this);
        track.clips.each (this.addClip, this);
      }
    },

    setTrackVolume : function (track, volume) {
      this.trackNodes[track.id].gain.value = volume;
    },

    muteTrack : function (track) {
      this.trackNodes[track.id].gain.value = 0;
    },

    unmuteTrack : function (track) {
      this.trackNodes[track.id].gain.value = track.get ("volume"); //FIXME set with volume
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
      this.soloedTrack = null;
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

    // TODO : try to DRY these three methods below

    sourceOffsetChanged : function (clip, offset) {
      if (this.playing) {
        var source = this.playingSources [clip.id];
        source.noteOff (0);
        var end = source.buffer.duration + offset - clip.get ("end_offset");
        if (end > this.context.currentTime - this.startTime + this.playbackFrom)
          this.playNote (clip, offset + this.startTime +
                         clip.get ("begin_offset") - this.playbackFrom);
      }
    },

    beginOffsetChanged : function (clip, offset) {
      if (this.playing) {
        var source = this.playingSources [clip.id];
        source.noteOff (0);
        var end = source.buffer.duration + clip.get ("source_offset") -
          clip.get ("end_offset");
        if (end > this.context.currentTime - this.startTime + this.playbackFrom)
          this.playNote (clip, clip.get ("source_offset") + this.startTime +
                         offset - this.playbackFrom);
      }
    },

    endOffsetChanged : function (clip, offset) {
      if (this.playing) {
        var source = this.playingSources [clip.id];
        source.noteOff (0);
        var end = source.buffer.duration + clip.get ("source_offset") -
          clip.get ("end_offset");
        if (end > this.context.currentTime - this.startTime + this.playbackFrom)
          this.playNote (clip, clip.get ("source_offset") + this.startTime +
                         clip.get ("begin_offset") - this.playbackFrom);
      }
    },

    schedule : function () {
      var time = this.context.currentTime - this.startTime + this.playbackFrom;
      this.model.set ("playingAt", time);
      // We need to loop if
      if (!this.exporting && // we are not exporting
	this.model.get ("looping") && // and looping is set to true in the model
	  Math.floor (time * 100) >= // and it's time to loop !
	  Math.floor (this.model.get ("regionEnd") * 100)) {
	this.stopNotes ();
	this.model.set ("playingAt", this.model.get ("regionBegin"));
 	this.model.play ();
	return;
      }
      if (time >= this.end) {
	this.model.stop ();
	return;
      }
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
        source.noteGrainOn (0, beginOffset + offset, length - offset);
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

      var clipEnd;
      var self = this;
      _.each (this.model.clips (), function (clip) {
        var buffer = self.buffers [clip.get ("audio_source_id")],
        sourceOffset = clip.get ("source_offset"),
        beginOffset  = clip.get ("begin_offset"),
        endOffset    = clip.get ("end_offset");
        if (typeof buffer === 'undefined') return;
        clipEnd = buffer.duration + sourceOffset - endOffset;
        if (clipEnd > self.playbackFrom)
          self.playNote (clip, self.startTime +
                         sourceOffset + beginOffset - self.playbackFrom);
      });
      if (!this.end) this.end = clipEnd;
      this.model.set ("playing", true);
      this.schedule ();
    },

    stopNotes : function () {
      clearTimeout (this.timeoutId);
      if (this.exporting) this.stopExport ();
      this.playing = false;
      this.model.set ({ playing : false, exporting : false });
      _.each (this.playingSources, function (source) { source.noteOff (0) });
      this.playingSources = {};
    },

    volumeChange : function(volume, cid) {
      this.gainNodes[cid].gain.value = volume;
    }

  });
});