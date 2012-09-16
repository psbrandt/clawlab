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
  "views/sequencer_view",
  "views/transport_view",
  // jquery plugins at the end
  "getscrollbarwidth"
], function($, _, Backbone, mainTemplate, TrackView, ActionTreeView, 
            SequencerView, TransportView) {
  return Backbone.View.extend ({

    template : _.template (mainTemplate),

    initialize : function () {

      // listen when a track is created
      this.model.tracks.bind ("add", this.addTrack);

      // to access the sequencer view
      this.sequencerView = new SequencerView ({
        model : this.model
      });

      var self = this;
      $(window).resize (function () {
        self.setWorkspaceDimensions ();
        self.sequencerView.render ();
      });
    },
    
    render : function () {
      // Setting #main with the main template
      $(this.el).html (this.template ());

      // Render the transport view
      new TransportView({
        model : this.model
      }).render ();

      // Setting workspace dimensions
      this.setWorkspaceDimensions ();

      // Setting el and rendering sequencer
      this.sequencerView.el = $("#sequencer");
      this.sequencerView.render ();
      // NOTE : this line should not be here ... but needed to rerender timeline
      $("#sequencer").scroll (this.sequencerView.render);
      // Render tracks
      this.model.tracks.each (this.addTrack);
      
      // Render action tree
      new ActionTreeView ({
        model : this.model.get("root_action"),
        el : $("#right-bar .content")
      }).render ();

      return this;
    },
    
    renderSequencer : function () {
      this.sequencerView.render ();
    },

    setWorkspaceDimensions : function () {
      // Workspace width
      $("#workspace").css ("width", window.innerWidth // inner width
                           - $("#right-bar").width () // minus right-bar width
                           - $.getScrollbarWidth () // minus scrollbars width
                           - 1 ); //minus 1 for FF ...
      // Workspace height
      $("#workspace").css ("height", window.innerHeight - // inner height
                           $("#transport").height () - // minus transport height
                           $(".topbar").height () - // minus topbar height
                           $.getScrollbarWidth ()); // minus scrollbar width
      // Workspace margin top for the timeline
      $("#tracks-controls").css ("margin-top", this.sequencerView.timelineHeight);
      // right-bar height
      $("#right-bar").css ("height", window.innerHeight - // inner height
                           $("#transport").height () - // minus transport height
                           $(".topbar").height () - // minus topbar height
                           $.getScrollbarWidth ()); // minus scrollbar width
    },

    addTrack : function (trackModel) {
      new TrackView ({ model : trackModel }).render ();
    }
  });
});