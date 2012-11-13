define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/transport.html",
  "text!templates/export.html",
  // jquery plugins at the end
  "libs/jquery.editinplace"
], function($, _, Backbone, Track, transportT, exportTemplate) {
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
      this.model.on ("exported", this.exported);
      $(document).on ("keyup", this.handleKey);
    },

    render : function () {
      var data = {
        title : this.model.get("title"),
        bpm   : this.model.get ("bpm")
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
    
    loopClicked : function (e) {
      if ($(e.currentTarget).hasClass ("active"))
	this.model.set ("looping", false);
      else
	this.model.set ("looping", true);
    },

    exported : function (blob) {
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = $("<br /><a>Download " + blob.type + " (" + 
		   Claw.Helpers.bytesToSize (blob.size) + ")</a>");
      link.attr ("href", url);
      link.attr ("download", "output.wav");
      $(".export-modal .modal-body").append (link);
    },

    exportingChanged : function (model, exporting) {
      if (exporting) {
	$(".export-master-btn").button ("loading");
	$(".export-modal .close-btn").attr ("disabled", "disabled");
      }
      else {
	$(".export-master-btn").button ("reset");
	$(".export-modal .close-btn").removeAttr ("disabled");
      }
    },

    handleKey : function (e) {
      if (e.srcElement.localName != "body") return;

      switch (e.which) {
      case 32 : // space bar
        $("#play-btn").trigger ("click");
        break;
      case 48 : case 96 : // 0 key
        $("#rewind-btn").trigger ("click");
        break;
      case 107 : case 191 : // + key
        $("#zoom-in-btn").trigger ("click");
        break;
      case 109 : case 187 : // - key
        $("#zoom-out-btn").trigger ("click");
        break;
      case 78 : // n key
        $("#add-track-btn").trigger ("click");
        break;
      case 8 : // delete
      case 46 : // suppr
        $("#menu-delete").trigger ("click");
	e.preventDefault ();
        break;
      }
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
	tracks : this.model.tracks
      });
      this.$el.append (modal);
      $(modal).modal ({
	backdrop : true
      }).on ("hidden", function () { $(this).remove () })
	.find (".export-master-btn").on ("click", function () {
	  self.model.exportMaster ();
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