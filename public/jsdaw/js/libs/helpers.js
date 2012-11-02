/**
 * Helpers functions
 */
define([
], function() {
  var Helpers = function (data) {
    this.bpm = data.bpm;
    this.pxPerBeat = data.pxPerBeat;
    this.snapOn = 1/2;
  }
  
  Helpers.prototype = {
    bytesToSize : function (bytes) {
      if(bytes <= 0) return '0';
      var t2 = Math.min(Math.round(Math.log(bytes)/Math.log(1024)), 12);
      return (Math.round(bytes * 100 / Math.pow(1024, t2)) / 100) +
	(" KMGTPEZYXWVU").charAt(t2).replace(' ', '') + 'B';
    },

    snap : function (sec) {
      return this.beatsToSec (this.snapOn * Math.round (sec / this.beatsToSec (this.snapOn)));
    },

    snapPx : function (px) {
      var snapOnPx = this.beatsToPx (this.snapOn);
      return snapOnPx * Math.round (px / snapOnPx)
    },
    
    pxToSec : function (px) {
      return 60 * px / (this.bpm * this.pxPerBeat);
    },
    
    secToPx : function (sec) {
      return this.secToBeats (sec) * this.pxPerBeat;
    },
    
    beatsToSec : function (n) {
      return n * (60 / this.bpm);
    },
    
    secToBeats : function (sec) {
      return (sec / 60) * this.bpm;
    },
    
    beatsToPx : function (n) {
      return n * this.pxPerBeat;
    }
  }
  return Helpers;
});