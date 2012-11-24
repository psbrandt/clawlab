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
    },
    // Retrieve float from string with a precision of `len`
    float: function(val, len) {
      var scaler;
      if (len == null) { len = 2; }
      if (!((val != null) && val !== "")) { return 0; }
      return parseFloat((Math.round((parseFloat(val.toString().replace(/\,/, '.'), 10)) * (scaler = Math.pow(10, len))) / scaler).toString().replace(new RegExp("^([0-9]+\.[0-9]{0,2})[0-9]*"), "$1"), 10);
    },
    // Retrieve float from css string (possibly looking like "100px")
    floatFromCss: function(val) {
      return Claw.Helpers.float(val.replace('px', ''));
    }
  }
  return Helpers;
});