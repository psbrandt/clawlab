/**
 * Helpers functions
 */
define([
], function() {
  var Helpers = function (data) {
    this.bpm = data.bpm;
    this.pxPerBeat = data.pxPerBeat;
  }
  
  Helpers.prototype = {
    
    pxToSec : function (px) {
      return this.beatsToSec (px / this.pxPerBeat);
    },
    
    secToPx : function (sec) {
      return this.secToBeats (sec) * this.pxPerBeat;
    },
    
    beatsToSec : function (n) {
      return n * (60 / this.bpm);
    },
    
    secToBeats : function (sec) {
      return (sec * 60) / this.bpm;
    },
    
    beatsToPx : function (n) {
      return n * this.pxPerBeat;
    }
  }
  return Helpers;
});