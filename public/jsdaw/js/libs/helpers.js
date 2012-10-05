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