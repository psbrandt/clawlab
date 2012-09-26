/**
 * The song version view contains the workspace (tracks, transport bar and more)
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/main.html", 
  "views/track_view",
  "views/track_controls_view",
  "views/action_tree_view",
  "views/library_view",
  "views/timeline_view",
  "views/transport_view",
  // jquery plugins at the end
  "getscrollbarwidth"
], function($, _, Backbone, mainTemplate, TrackView, TrackControlsView, 
            ActionTreeView, LibraryView, TimelineView, TransportView) {
  return Backbone.View.extend ({

    template : _.template (mainTemplate),

    events : {
      "click #right-bar .nav a" : "rightBarMenuClicked"
    },

    rightBarMenuClicked : function (e) {
      e.preventDefault();
      $(e.currentTarget).tab ("show");
    },

    initialize : function () {
      // listen when a track is created
      this.model.tracks.bind ("add", this.addTrack, this);

      var self = this;
      $(window).resize (function () {
        self.setWorkspaceDimensions ();
        self.timelineView.render ();
      });
      this.model.on ("change:scale", this.render, this);
      this.model.on ("change:rightBarVisible", this.rightBarVisibilityChanged, this);
    },
    
    render : function () {
      // Setting #main with the main template
      this.$el.html (this.template ({
        rightBarVisible : this.model.get ("rightBarVisible")
      }));

      var self = this;
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

      new LibraryView ({
        collection : this.model.audioSources,
        el : $("#library")
      }).render ();
      
      // Render action tree
      new ActionTreeView ({
        model : this.model,
        el : $("#action-tree")
      }).render ();
      
      return this;
    },

    rightBarVisibilityChanged : function (model, visible) {
      if (visible)
        this.$el.find ("#right-bar").show ("fast")
      else
        this.$el.find ("#right-bar").hide ("fast")
      this.setWorkspaceDimensions ();
      this.timelineView.render ();
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
      // grid stage width, height and margin top
      $("#timeline-stage").css ({
        "width" : $("#sequencer").innerWidth (),
        "height" : $("#sequencer").height () 
          - $.getScrollbarWidth () // minus scrollbars width
          - $("#workspace").scrollTop ()
          + this.model.get ("timelineHeight"),
        "margin-top" : -this.model.get ("timelineHeight")
      });
    },
    
    addTrack : function (trackModel) {
      var trackControlsView = new TrackControlsView ({ 
        model : trackModel
      }).render ();
      var trackView = new TrackView ({ 
        model : trackModel
      }).render ();

      this.$el.find ("#tracks").append (trackView.el);
      this.$el.find ("#tracks-controls").append (trackControlsView.el);
    }
  });
});