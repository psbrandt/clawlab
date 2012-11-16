define([
  "jquery",
  "underscore",
  "backbone",
  "models/track", 
  "text!templates/menu_bar.html",
  "text!templates/export.html",
  "text!templates/download_button.html",
  // mousetrap plugins
  "mousetrap-bind",
  "mousetrap-pause",
  // jquery plugins at the end
  "libs/jquery.editinplace"
], function($, _, Backbone, Track, menuBarTemplate, exportTemplate, 
	    downloadButtonT) {
  return Backbone.View.extend ({

    events : {
      "click #menu-add-track"   : "addTrackClicked",
      "click #menu-zoom-in"     : "zoomInClicked",
      "click #menu-zoom-out"    : "zoomOutClicked",
      "click #menu-toggle-right-bar" : "toggleRightBarClicked",
      "click #menu-delete"      : "menuDeleteClicked",
      "click #menu-export"      : "menuExportClicked"
    },

    template : _.template (menuBarTemplate),

    initialize : function () {
      this.model.on ("change:exporting", this.exportingChanged);
      this.model.on ("exported", this.exported, this);

      var self = this;
      var del = ["del", "backspace"];
      Mousetrap.bind ({
	"+" : function () { self.zoomInClicked () },
	"-" : function () { self.zoomOutClicked () },
	"n" : function () { self.addTrackClicked () },
	del : function () { 
	  self.menuDeleteClicked ();
	  return false; // to avoid triggering previous page
	},
	"command+e" : function () { self.menuExportClicked () }
      });
    },

    render : function () {
      var data = {
	title : this.model.get ("title")
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

    exported : function (blob) {
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = _.template(downloadButtonT, {
	url : url,
	name : this.model.get ("title"),
	type : blob.type,
	size : Claw.Helpers.bytesToSize (blob.size)
      });
      $(".export-modal .modal-body .wait").html (link);
    },

    exportingChanged : function (model, exporting) {
      if (exporting)
	$(".export-master-btn").button ("loading");
      else {
	$(".export-master-btn").button ("reset");
	$(".export-modal .modal-body").append (
	  "<p class='wait'>Generating file. Please wait ...</p>"
	)
      }
    },

    menuDeleteClicked : function () {
      this.model.deleteSelectedClips ();
    },

    menuExportClicked : function () {
      var self = this;

      var modal = _.template (exportTemplate, {
	tracks : this.model.tracks,
	regionLength : this.model.get ("regionEnd") - 
	  this.model.get ("regionBegin")
      });
      this.$el.append (modal);
      Mousetrap.pause ();// unbind keyboard shortcuts
      $(modal).modal ({
	backdrop : "static"
      }).on ("hidden", function () { 
	self.model.cancelExport (); 
	$(this).remove ();
	Mousetrap.unpause (); // rebind keyboard shortcuts
      }).find (".export-master-btn").on ("click", function () {
	self.model.exportMaster ({
	  region : $(".export-modal .selected-region").hasClass ("active")
	})
      });
    },

    toggleRightBarClicked : function (e) {
      if ($("#toggle-right-bar-btn").toggleClass ("active")
	  .hasClass ("active"))
        this.model.set ("rightBarVisible", true)
      else
        this.model.set ("rightBarVisible", false)
    },

    zoomInClicked : function () {
      this.model.zoomIn ();
    },

    zoomOutClicked : function () {
      this.model.zoomOut ();
    },

    addTrackClicked : function () {
      this.model.addTrack ();
    }
  });
  
});