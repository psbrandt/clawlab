/**
 * The song version view contains the workspace (tracks, transport bar and more)
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/main.html", 
  "views/track_view",
  "views/action_tree_view",
  "views/library_view",
  "views/sequencer_view",
  "views/transport_view",
  // jquery plugins at the end
  "getscrollbarwidth"
], function($, _, Backbone, mainTemplate, TrackView, ActionTreeView, LibraryView,
            SequencerView, TransportView) {
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

      this.sequencerView;

      var self = this;
      $(window).resize (function () {
        self.setWorkspaceDimensions ();
        self.sequencerView.render ();
      });
      this.model.on ("change:scale", this.render, this);
      this.model.on ("change:rightBarVisible", this.rightBarVisibilityChanged, this);
    },
    
    render : function () {
      // Setting #main with the main template
      this.$el.html (this.template ({
        rightBarVisible : this.model.get ("rightBarVisible")
      }));

      // Setting workspace dimensions
      this.setWorkspaceDimensions ();

      // Setting el and rendering sequencer
      this.sequencerView = new SequencerView ({
        model : this.model,
        el : "#sequencer"
      }).render ();
      
      // Render tracks
      this.renderTracks ();

      this.sequencerView.stage.draw ();

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
      this.sequencerView.render ();
    },

    renderTracks : function () {
      var self = this;
      this.model.tracks.each (function (track) { self.addTrack (track) });
    },
    
    setWorkspaceDimensions : function () {
      $("#right-bar").width (
        this.model.get ("rightBarVisible") ? 300 : 0
      )
      // Workspace width
      $("#workspace").css ("width", window.innerWidth // inner width
                           - $("#right-bar").width () // minus right-bar width
                           - $.getScrollbarWidth () // minus scrollbars width
                           - 1 ); //minus 1 for FF ...
      // Workspace height
      $("#workspace").css ("height", window.innerHeight // inner height
                           - $("#transport").height () // minus transport height
                           - $(".topbar").height () // minus topbar height
                           - $.getScrollbarWidth ()); // minus scrollbar width
      // Workspace margin top for the timeline
      $("#tracks-controls").css ("margin-top", this.model.get ("timelineHeight"));
      // right-bar height
      $("#right-bar").css ("height", window.innerHeight // inner height
                           - $("#transport").height () // minus transport height
                           - $(".topbar").height () // minus topbar height
                           - $.getScrollbarWidth ()); // minus scrollbar width
    },
    
    addTrack : function (trackModel) {
      var trackView = new TrackView ({ 
        model : trackModel
      }).render ();
      this.sequencerView.tracksLayer.add (trackView.kineticNode);
      $("#tracks-controls", this.el).append (trackView.el);
    }
  });
});