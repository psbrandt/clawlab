/**
 * The song version view contains the workspace (tracks, transport bar and more)
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/main.html", 
  "text!templates/dropzone.html", 
  "views/track_view",
  "views/track_controls_view",
  "views/ghost_track_controls_view",
  "views/timeline_view",
  "views/transport_view",
  "views/library_view",
  "views/sharing_view",
  "views/action_tree_view",
  "views/chat_view",
  "models/chat",
  "models/song_version",
  // jquery plugins at the end
  "getscrollbarwidth",
  "jqueryui"
], function($, _, Backbone, mainTemplate, dropzoneTemplate, TrackView, 
            TrackControlsView, GhostTrackControlsView, TimelineView, 
            TransportView, LibraryView, SharingView, ActionTreeView, 
            ChatView, ChatModel, SongVersion) {
  return Backbone.View.extend ({

    template : _.template (mainTemplate),

    events : {
      "click #right-bar .nav a" : "rightBarMenuClicked",
      "drop .dropzone"          : "dropped"
    },
    
    rightBarMenuClicked : function (e) {
      e.preventDefault();
      $(e.currentTarget).tab ("show");
    },

    initialize : function () {
      try {
        this.chatModel = new ChatModel ({
          song_version_id : this.model.id,
          user : this.model.get ("user")
        })
      } catch (e) { console.log ("Faye server not found") }

      // listen when a track is created
      this.model.tracks.bind ("add", this.addTrack, this);

      var self = this;
      $(window).resize (function () {
        self.setWorkspaceDimensions ();
        self.timelineView.render ();
      });
      this.model.on ("change:scale", this.render, this);
      this.model.on ("change:rightBarVisible", this.rightBarVisibilityChanged, this);
      this.model.on ("change:ghost", this.render, this);
      this.model.on ("merged", this.render, this);
    },
    
    render : function () {
      // Setting #main with the main template
      this.$el.html (this.template ({
        rightBarVisible : this.model.get ("rightBarVisible")
      }));

      // make clips selectable
      this.$el.find ("#tracks").selectable ({
        filter : ".clip",
        selected : function (e, ui) { $(ui.selected).trigger ("selected") },
        unselected : function (e, ui) { $(ui.unselected).trigger ("unselected") }
      });

      // The left-bar dropzone
      this.$el.find (".dropzone").html (_.template (dropzoneTemplate, {
        text : "Drop audio files<br />(.wav or .mp3) here"
      })).droppable ({
        accept : ".audio-source"
      });
      // Initialize fileupload
      this.$fileupload = this.$el.find('input:file.file-upload-field')
      // Listen drop or add
      this.$fileupload.fileupload({
        dropZone: this.$el.find('#left-bar .dropzone'),
        fileInput: null,
        add: _.bind(this.handleFileSelect, this),
        dataType: 'json'
      })

      var self = this;
      // On scroll, reset dimensions
      this.$el.find ("#sequencer, #workspace").on ("scroll", function (e) {
        self.setWorkspaceDimensions ();
        self.model.set ({
          "scrollLeft" :  $(e.target).scrollLeft (),
          "scrollTop"  :  $(e.target).scrollTop ()
        });
      });
      
      // Setting workspace dimensions
      this.setWorkspaceDimensions ();

      this.timelineView = new TimelineView ({
        model : this.model,
        el : "#timeline-stage"
      }).render ();
      
      // Render tracks
      this.model.tracks.each (function (track) { self.addTrack (track) });

      // Render ghost tracks
      var ghost = this.model.get ("ghost")
      if (ghost)
        this.model.get ("ghost").tracks.each (function (track) {
          self.addGhostTrack (track);
        });

      var libraryView = new LibraryView ({
        collection : this.model.audioSources
      }).render ();
      
      var sharingView = new SharingView ({
        model : this.model
      }).render ();

      // Render action tree
      var actionTreeView = new ActionTreeView ({
        model : this.model
      }).render ();
      
      $("#right-bar .nav").append (
        libraryView.elMenu, 
        sharingView.elMenu, 
        actionTreeView.elMenu
      );
      $("#right-bar .tab-content").append (
        libraryView.el, sharingView.el, actionTreeView.el
      );

      if (this.chatModel) {
        var chatView = new ChatView ({
          model : this.chatModel
        }).render ();
        $("#right-bar .nav").append (chatView.elMenu);
        $("#right-bar .tab-content").append (chatView.el);
      }

      return this;
    },

    dropped : function (e, ui) {
      if (ui == undefined) return;
      var track = this.model.addTrack (function (track) {
        track.addClip (ui.helper.context.id, 0);
      });
    },

    handleFileSelect : function ($e, data) {
      for (var i = 0, f; f = data.files[i]; i++) {
        var audioSource = 
          this.model.audioSources.addFromFile (f, this.$fileupload);
        var track = this.model.addTrack (function (track) {
          track.addClip (audioSource.id, 0);
        });
      }
    },

    rightBarVisibilityChanged : function (model, visible) {
      if (visible)
        this.$el.find ("#right-bar").show ("fast")
      else
        this.$el.find ("#right-bar").hide ("fast")
      this.setWorkspaceDimensions ();
      this.timelineView.render ();
    },

    addTrack : function (trackModel) {
      var trackControlsView = new TrackControlsView ({ 
        model : trackModel,
        attributes : { "data-id" : trackModel.id }
      }).render ();
      var trackView = new TrackView ({ 
        model : trackModel,
        attributes : { "data-id" : trackModel.id }
      }).render ();
          
      this.$el.find ("#tracks").append (trackView.el);
      this.$el.find ("#tracks-controls").append (trackControlsView.el);

    },

    addGhostTrack : function (ghostTrack) {
      var ghost = this.model.get ("ghost");
      if (!ghost) return;

      var sisterTrack = this.model.tracks.get (ghostTrack.id)
      ghostTrack.set ("status", (sisterTrack)?"diff":"new");

      ghostTrack.set ("user", ghost.get ("user"));
      ghostTrack.set ("songVersionId", ghost.get("_id"));
      var ghostTrackControlsView = new GhostTrackControlsView ({ 
        model : ghostTrack
      }).render ();
      var ghostTrackView = new TrackView ({ 
        model : ghostTrack
      }).render ();

      // append after sister if it exists else at the end
      if (sisterTrack) {
        this.$el.find (".track[data-id='" + sisterTrack.id + "']")
          .after (ghostTrackView.el);
        this.$el.find (".track-controls[data-id='" + sisterTrack.id + "']")
          .after (ghostTrackControlsView.el);
      } else {
        this.$el.find ("#tracks").append (ghostTrackView.el);
        this.$el.find ("#tracks-controls").append (ghostTrackControlsView.el);
      }
    },

    setWorkspaceDimensions : function () {
      // right-bar height and width
      $("#right-bar").css ({
        "height" : window.innerHeight // inner height
          - $("#transport").height () // minus transport height
          - $(".topbar").height () // minus topbar height
          - $.getScrollbarWidth (), // minus scrollbar width
        "width" : this.model.get ("rightBarVisible") ? 300 : 0
      });

      // Workspace width, height and margin top
      $("#workspace").css ({
        "width" : window.innerWidth // inner width
          - $("#right-bar").width () // minus right-bar width
          - $.getScrollbarWidth () // minus scrollbars width
          - 1, //minus 1 for FF ...
        "height" : window.innerHeight // inner height
          - $("#transport").height () // minus transport height
          - $(".topbar").height () // minus topbar height
          - this.model.get ("timelineHeight"),
        "margin-top" : this.model.get ("timelineHeight")
      });
      // Sequencer margin left and height
      $("#sequencer").css ({
        "height" : $("#workspace").height () 
          + $("#workspace").scrollTop ()
      });

      // 10 minutes of song
      $("#tracks").width (Claw.Helpers.secToPx (600))

      // grid stage width, height and margin top
      $("#timeline-stage").css ({
        "width" : $("#sequencer").innerWidth (),
        "height" : $("#sequencer").height () 
          - $.getScrollbarWidth () // minus scrollbars width
          - $("#workspace").scrollTop ()
          + this.model.get ("timelineHeight"),
        "margin-top" : -this.model.get ("timelineHeight")
      });
    }
    
  });
});