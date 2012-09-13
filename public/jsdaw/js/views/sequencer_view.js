/**
 * Sequencer view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/sequencer.html"
], function($, _, Backbone, sequencerTemplate) {
  return Backbone.View.extend ({

    template : _.template (sequencerTemplate),

    events : {
      "resize window" : "test"
    },

    test : function () {
      console.log ("df");
    },

    initialize : function () {
      // Listen to resize event ?
      var self = this;

      // if window size changed, re-render
      $(window).resize (function () {
        self.render ()
      });
    },

    render : function () {
      $(this.el).html (this.template ());
      // TODO : set canvas width, draw timeline
      var canvas = $("canvas", this.el);
      $(canvas).attr("width", this.getWidth ());
      $(canvas).attr("height", this.getHeight ());
      $(this.el).css ("margin-left", $("#left-bar").innerWidth ());
    },

    /**
     * Get available height in client window. Substract left and right
     * bars width
     */
    getWidth : function () {
      return $("#main").innerWidth() - $("#left-bar").innerWidth() - $("#right-bar").innerWidth();
    },

    /**
     * Get available height
     */
    getHeight : function () {
      return window.innerHeight - $("#transport").height ();
    }
  });
});