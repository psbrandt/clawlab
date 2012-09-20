/**
 * Sequencer view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/sequencer.html",
  "views/clip_view",
  // at the end because not defining Require modules
  "getscrollbarwidth",
  "kinetic"
], function($, _, Backbone, sequencerTemplate, ClipView) {
  return Backbone.View.extend ({

    template : _.template (sequencerTemplate),

    events : {
      "scroll" : "render"
    },

    initialize : function () {
      _.bindAll (this, "render");

      // An index for tracks
      this.index = 0;

      // The timeline height
      this.timelineHeight = 20;
      this.rendered = false;

    },

    offsetX : function () {
      return $(this.el).scrollLeft ();
    },

    offsetY : function () {
      return $("#workspace").scrollTop ();
    },

    render : function () {
      if (this.rendered) {
        // Setting #sequencer dimension
        $(this.el).css ("width", this.getAvailableWidth());
        $(this.el).css ("height", this.getAvailableHeight());
        $(this.el).css ("margin-left", $("#left-bar").innerWidth ());

        this.stage.setSize (
          $(this.el).innerWidth (),
          $(this.el).innerHeight () - $.getScrollbarWidth ()
        );
        this.tracksGroup.setX (-this.offsetX ());
        this.tracksGroup.setY (-this.offsetY ());
        this.stage.draw ();
      }
      else {
        $(this.el).html (this.template ());
      
        // Setting #sequencer dimension
        $(this.el).css ("width", this.getAvailableWidth());
        $(this.el).css ("height", this.getAvailableHeight());
        $(this.el).css ("margin-left", $("#left-bar").innerWidth ());

        // #sequencer is droppable. It can receive audio sources
        this.$el.droppable ();

        this.initKinetics ();
        this.rendered = true;
      }
      return this;
    },

    initKinetics : function () {
      // Initialiazing the stage at the dimensions of #sequencer
      this.stage = new Kinetic.Stage ({
        container : "sequencer",
        width : $(this.el).innerWidth (),
        height : $(this.el).innerHeight () - $.getScrollbarWidth ()
      });
      // A hack needed because default position is set to relative
      $(".kineticjs-content").css ("position", "fixed");

      // The layer (maybe we'll need more)
      this.layer = new Kinetic.Layer ();

      var self = this;
      // The timeline shape (list of numbers at the top)
      this.timeline = new Kinetic.Shape ({
        drawFunc : function (ctx) {
          self.drawTimeline (ctx)
        }
      });

      // The grid, vertical lines
      this.grid = new Kinetic.Shape ({
        drawFunc : function (ctx) {
          self.drawGrid (ctx)
        }
      });

      // A group for tracks
      this.tracksGroup = new Kinetic.Group ();

      this.layer.add (this.grid);
      this.layer.add (this.tracksGroup); // the clips over the grid
      this.layer.add (this.timeline); // the timeline over the clips
      this.stage.add (this.layer);
    },

    trackHeight : function () {
      return $(".track-controls").height();
    },

    incIndex : function () {
      return this.index++;
    },

    appendTrack : function (trackView) {
      this.tracksGroup.add  (trackView.kineticNode);
      trackView.kineticNode.setY (
        this.timelineHeight + this.trackHeight() * this.incIndex ()
      );
    },

    appendClip : function (clipView, trackView) {
      trackView.kineticNode.add (clipView.kineticNode);
      this.stage.draw ();
    },

    /**
     *  Draw the timeline with the given offset on the given 2D context 
     */
    drawTimeline : function (ctx) {
      var grid_every = 1/8
        , ctx_width  = ctx.canvas.width
        , ctx_height = ctx.canvas.height
        , step_width = Claw.Helpers.beatsToPx (grid_every)
        , offsetX    = this.offsetX ()
        , is_beat    = function(n) {return (n % (1 / grid_every)) == 0;}
        , is_bar     = function(n) {return (n % (4 / grid_every)) == 0;};

      // Filling the top area that will contain timeline numbers
      ctx.fillStyle = '#444';
      ctx.fillRect(0, 0, ctx_width, this.timelineHeight-1);
      
      for(var i = (Math.ceil (offsetX / step_width)), 
	  max = (Math.ceil(ctx_width / step_width) + offsetX); 
	  i < max; i++) {
        var x = i * step_width + 1 - offsetX
        var drawStroke = false;
        if(is_bar(i)) {
          drawStroke = true;
          ctx.strokeStyle = "#fff";
          ctx.fillStyle = "#fff";
          ctx.font = "Arial 30px";
          ctx.fillText((i / (4 / grid_every)) + 1, x + 5, 12);
        }
        else if(is_beat(i)) {
          drawStroke = true;
          ctx.strokeStyle = "#bbb";
          ctx.fillStyle = "#ccc";
          ctx.fillText(Math.floor((i / (4 / grid_every)) + 1).toString() + '.' + 
                       (((i / 8) % (4 / grid_every) % 4) + 1), 
                       x + 4, 12);
        }
        if (drawStroke) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.timelineHeight);
          ctx.closePath();
          ctx.stroke();
        }
      }
    },

    /**
     *  Draw a grid on the given 2D context 
     */
    drawGrid : function (ctx) {
      var grid_every = 1 / 8
        , ctx_width  = ctx.canvas.width
        , ctx_height = ctx.canvas.height
        , step_width = Claw.Helpers.beatsToPx (grid_every)
        , offsetX    = this.offsetX ()
        , is_beat    = function(n) {return (n % (1 / grid_every)) == 0;}
        , is_bar     = function(n) {return (n % (4 / grid_every)) == 0;};

      for(var i = (Math.ceil (offsetX / step_width)), 
	  max = (Math.ceil(ctx_width / step_width) + offsetX); 
	  i < max; i++) {
        var x = i * step_width + 1 - offsetX,
        start_y = 0;
        if(is_bar(i)) {
          ctx.strokeStyle = "#fff";
        }
        else if(is_beat(i)) {
          ctx.strokeStyle = "#bbb";
        }
        else {
          ctx.strokeStyle = "#888";
          start_y = this.timelineHeight;
        }
        
        //console.log(x, 0, x + (step_width - 2), ctx_height);
        ctx.beginPath();
        ctx.moveTo(x, this.timelineHeight);
        ctx.lineTo(x, ctx_height);
        ctx.closePath();
        ctx.stroke();
      }
    },

    /**
     * Get available width in workspace
     */
    getAvailableWidth : function () {
      return $("#workspace").innerWidth() - $("#left-bar").innerWidth() - $.getScrollbarWidth ();
    },

    /**
     * Get available height
     */
    getAvailableHeight : function () {
      var topbarHeight = $(".topbar").height();
      return window.innerHeight - $("#transport").height () - topbarHeight;
    }
  });
});