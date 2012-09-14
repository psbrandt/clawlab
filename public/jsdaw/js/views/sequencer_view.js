/**
 * Sequencer view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/sequencer.html",
  "getscrollbarwidth"
], function($, _, Backbone, sequencerTemplate) {
  return Backbone.View.extend ({

    template : _.template (sequencerTemplate),

    initialize : function () {
    },

    render : function () {
      $(this.el).html (this.template ());
      
      // Setting #sequencer dimension
      $(this.el).css ("width", this.getWidth());
      $(this.el).css ("height", this.getHeight());
      $(this.el).css ("margin-left", $("#left-bar").innerWidth ());

      // Setting canvas dimension inside #sequencer
      var canvas = $("canvas", this.el);
      $(canvas).attr("width",  $(this.el).innerWidth () - $.getScrollbarWidth ());
      $(canvas).attr("height", $(this.el).innerHeight () - $.getScrollbarWidth ());

      return this;
    },

    /**
     * Get available wodth in workspace
     */
    getWidth : function () {
      return $("#workspace").innerWidth() - $("#left-bar").innerWidth() - $.getScrollbarWidth ();
    },

    /**
     * Get available height
     */
    getHeight : function () {
      var topbarHeight = 27; //huh ...
      return window.innerHeight - $("#transport").height () - topbarHeight;
    }
  });
});