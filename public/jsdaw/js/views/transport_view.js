define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/transport.html",
  "text!templates/export.html",
  "text!templates/download_button.html",
  "mousetrap",
  // jquery plugins at the end
  "libs/jquery.editinplace"
], function($, _, Backbone, Track, transportT, exportTemplate, 
	    downloadButtonT, Mousetrap) {
  return Backbone.View.extend ({

    events : {
      "click #add-track-btn"    : "addTrackClicked",
      "click #rewind-btn"       : "rewindClicked",
      "click #stop-btn"         : "stopClicked",
      "click #play-btn"         : "playPauseClicked",
      "click #loop-btn"         : "loopClicked",
      "click #zoom-in-btn"      : "zoomInClicked",
      "click #zoom-out-btn"     : "zoomOutClicked",
      "click #toggle-right-bar-btn" : "toggleRightBarClicked",
      "click #menu-delete"      : "menuDeleteClicked",
      "click #menu-export"      : "menuExportClicked"
    },

    template : _.template (transportT),

    initialize : function () {
      this.model.on ("change:playingAt", this.playingAtChanged, this);
      this.model.on ("change:playing", this.togglePlayingMode, this);
      this.model.on ("change:readyToPlay", this.toggleReadyMode, this);
      this.model.on ("change:exporting", this.exportingChanged);
      this.model.on ("change:regionBegin change:regionEnd", this.regionChanged, 
		     this);
      this.model.on ("exported", this.exported, this);
      //$(document).on ("keyup", this.handleKey);
      var self = this;
      Mousetrap.bind ("space", function () { 
	self.playPauseClicked ();
      });
      Mousetrap.bind ("0", function () { 
	self.rewindClicked ();
      });
      Mousetrap.bind ("1", function () {
	var wasPlaying = self.model.get ("playing");
	self.model.pause ();
	self.model.set ("playingAt", self.model.get ("regionBegin"));
	if (wasPlaying) self.model.play ();
      });
      Mousetrap.bind ("2", function () { 
	var wasPlaying = self.model.get ("playing");
	self.model.pause ();
	self.model.set ("playingAt", self.model.get ("regionEnd"));
	if (wasPlaying) self.model.play ();
      });
      Mousetrap.bind ("l", function (e) {
	self.loopClicked (e);
      });
      Mousetrap.bind ("+", function () { 
	self.zoomInClicked ();
      });
      Mousetrap.bind ("-", function () { 
	self.zoomOutClicked ();
      });
      Mousetrap.bind ("n", function () { 
	self.addTrackClicked ();
      });
      Mousetrap.bind (["del", "backspace"], function () { 
	self.menuDeleteClicked ();
	return false; // to avoid triggering previous page
      });
      Mousetrap.bind ("command+e", function () { 
	self.menuExportClicked ();
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

      this.$el.find (".title").editInPlace ({
        context : this,
        onChange : this.setTitle
      })
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
    
    loopClicked : function (e) {
      if (this.$el.find ("#loop-btn").toggleClass ("active")
	  .hasClass ("active"))
	this.model.set ("looping", true);
      else
	this.model.set ("looping", false);
    },

    exported : function (blob) {
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = _.template(downloadButtonT, {
	url : url,
	name : this.model.get ("title"),
	type : blob.type,
	size : Claw.Helpers.bytesToSize (blob.size)
      });
      $(".export-modal .modal-body").append (link);
    },

    exportingChanged : function (model, exporting) {
      if (exporting)
	$(".export-master-btn").button ("loading");
      else
	$(".export-master-btn").button ("reset");
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

    menuDeleteClicked : function () {
      this.model.deleteSelectedClips ();
    },

    menuExportClicked : function () {
      var self = this;

      var modal = _.template (exportTemplate, {
	tracks : this.model.tracks,
	regionLength : this.model.get ("regionBegin") - this.model.get ("regionEnd")
      });
      this.$el.append (modal);
      $(modal).modal ({
	backdrop : "static"
      }).on ("hidden", function () { 
	self.model.cancelExport (); 
	$(this).remove ();
      })
	.find (".export-master-btn").on ("click", function () {
	  self.model.exportMaster ({
	    region : $(".export-modal .selected-region").hasClass ("active")
	  })
	});
    },

    toggleRightBarClicked : function (e) {
      if ($(e.currentTarget).hasClass ("active"))
        this.model.set ("rightBarVisible", false)
      else
        this.model.set ("rightBarVisible", true)
      this.$el.find ("#toggle-right-bar-btn").toggleClass ("active");
    },

    zoomInClicked : function () {
      this.model.zoomIn ();
    },

    zoomOutClicked : function () {
      this.model.zoomOut ();
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

    addTrackClicked : function () {
      this.model.addTrack ();
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