/**
 * The song version view
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

      var self = this;
      $(window).resize (function () {
        self.renderSequencer ();
      });
    },
    
    render : function () {
      // Setting #main with the main template
      $(this.el).html (this.template ());

      // Render the transport view
      new TransportView({
        model : this.model
      }).render ();

      // Rendering sequencer
      this.renderSequencer ();

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
      this.setWorkspaceDimensions ();
      new SequencerView ({
        el : $("#sequencer")
      }).render ();
    },

    setWorkspaceDimensions : function () {
      $("#workspace").css ("width", window.innerWidth // inner width
                           - $("#right-bar").width () // minus right-bar width
                           - $.getScrollbarWidth () // minus scrollbars width
                           - 1 ); //minus 1 just in case ...
      $("#workspace").css ("height", window.innerHeight - // inner height
                           $("#transport").height () - // minus transport height
                           $(".topbar").height () - // minus topbar height
                           $.getScrollbarWidth ()); // minus scrollbar width
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