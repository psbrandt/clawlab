define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/transport.html",
  "text!templates/export.html",
  "text!templates/download_button.html",
  "mousetrap-bind",
  // jquery plugins at the end
  "libs/jquery.editinplace"
], function($, _, Backbone, Track, transportT, exportTemplate, 
	    downloadButtonT) {
  return Backbone.View.extend ({

    events : {
      "click #rewind-btn"       : "rewindClicked",
      "click #stop-btn"         : "stopClicked",
      "click #play-btn"         : "playPauseClicked",
      "click #loop-btn"         : "loopClicked",
      "click #toggle-right-bar-btn" : "toggleRightBarClicked"
    },

    template : _.template (transportT),

    initialize : function () {
      this.model.on ("change:playingAt", this.playingAtChanged, this);
      this.model.on ("change:playing", this.togglePlayingMode, this);
      this.model.on ("change:readyToPlay", this.toggleReadyMode, this);
      this.model.on ("change:regionBegin change:regionEnd", this.regionChanged, 
		     this);

      var self = this;
      Mousetrap.bind ({
	"space" : function () { self.playPauseClicked () },
	"0" : function () { self.rewindClicked () },
	"1" : function () { 
	  var wasPlaying = self.model.get ("playing");
	  self.model.pause ();
	  self.model.set ("playingAt", self.model.get ("regionBegin"));
	  if (wasPlaying) self.model.play ();
	},
	"2" : function () {
	  var wasPlaying = self.model.get ("playing");
	  self.model.pause ();
	  self.model.set ("playingAt", self.model.get ("regionEnd"));
	  if (wasPlaying) self.model.play ();
	},
	"l" : function () { self.loopClicked () }
      });
    },

    render : function () {
      var data = {
        title : this.model.get("title"),
        bpm   : this.model.get ("bpm"),
	regionBegin : this.model.get ("regionBegin"),
	regionEnd : this.model.get ("regionEnd")
      };
      this.$el.html (this.template (data));

      this.$el.find ('[rel="tooltip"]').tooltip ();

      //render directly in body
      $("body").append (this.el);
      return this;
    },

    regionChanged : function (model) {
      if (model.get ("regionEnd") - model.get ("regionBegin") <= 0)
	this.$el.find ("#loop-btn").attr ("disabled", "disabled");
      else
	this.$el.find ("#loop-btn").removeAttr ("disabled");
    },
    
    loopClicked : function () {
      if (this.$el.find ("#loop-btn").toggleClass ("active")
	  .hasClass ("active"))
	this.model.set ("looping", true);
      else
	this.model.set ("looping", false);
    },

    setTitle : function (title) {
      if (title == this.model.get ("title")) {
        this.$el.find (".title").editInPlace ("close");
        return;
      }
      var self = this;
      this.model.save ({ title : title }, { success : function (o, data) {
        self.$el.find (".title").editInPlace ("close", data.title);
      }}); 
    },

    toggleRightBarClicked : function (e) {
      if ($(e.currentTarget).hasClass ("active"))
        this.model.set ("rightBarVisible", false)
      else
        this.model.set ("rightBarVisible", true)
      this.$el.find ("#toggle-right-bar-btn").toggleClass ("active");
    },

    playingAtChanged : function (model, playingAt) {
      var beat = Math.floor (Claw.Helpers.secToBeats (playingAt));
      var min  = Math.floor ( playingAt / 60 );
      var sec  = Math.floor ( playingAt % 60);
      var ms   = Math.floor ( (playingAt * 1000) % 1000);
      var result = 
        (min < 10 ? "0" + min : min) + ":" + 
        (sec < 10 ? "0" + sec : sec) + ":" + 
        (ms  < 10 ? "00" + ms  : (ms < 100 ? "0" + ms : ms )) + " | " +
        Math.floor (beat / 4 + 1) + "." + (beat % 4 + 1);
      this.$el.find (".current-time").html (result);
    },

    toggleReadyMode : function (model, ready) {
      if (ready) 
	this.$el.find ("#play-btn").removeProp ("disabled");
      else 
	this.$el.find ("#play-btn").prop ("disabled", "disabled");
    },

    togglePlayingMode : function (model, playing) {
      if (playing) {
        this.$el.find("#play-btn i")
        .removeClass ("icon-play")
        .addClass ("icon-pause");
      }
      else {
        this.$el.find("#play-btn i")
          .removeClass ("icon-pause")
          .addClass ("icon-play");
      }
    },

    playPauseClicked : function () {
      this.model.get ("playing") ? this.model.pause () : this.model.play ();
    },

    stopClicked : function () {
      this.model.stop ();
    },
    
    rewindClicked : function () {
      if (this.model.get ("playing")) {
        this.model.stop (); 
        this.model.play ();
      }
      else 
        this.model.stop ()
    }
  });
  
});