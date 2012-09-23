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
      this.model.tracks.bind ("add", this.addTrack);

      var self = this;
      $(window).resize (function () {
        self.setWorkspaceDimensions ();
        Claw.SequencerView.render ();
      });
    },
    
    render : function () {
      // Setting #main with the main template
      $(this.el).html (this.template ());

      // Setting workspace dimensions
      this.setWorkspaceDimensions ();

      // Setting el and rendering sequencer
      Claw.SequencerView.setElement ($("#sequencer"));
      Claw.SequencerView.render ();
      // NOTE : fixme, should be in sequencer view but does not work
      $("#sequencer").scroll (Claw.SequencerView.render);
      $("#workspace").scroll (Claw.SequencerView.render);

      // Render tracks
      var self = this;
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
    
    setWorkspaceDimensions : function () {
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
      $("#tracks-controls").css ("margin-top", Claw.SequencerView.timelineHeight);
      // right-bar height
      $("#right-bar").css ("height", window.innerHeight // inner height
                           - $("#transport").height () // minus transport height
                           - $(".topbar").height () // minus topbar height
                           - $.getScrollbarWidth ()); // minus scrollbar width
    },
    
    addTrack : function (trackModel) {
      var view = new TrackView ({ 
        model : trackModel
      });
      Claw.SequencerView.appendTrack (view);
      $("#tracks-controls", this.el).append (view.render().el);
    }
  });
});