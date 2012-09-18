/**
 * Sequencer view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/sequencer.html",
  // at the end because not defining Require modules
  "getscrollbarwidth",
  "kinetic"
], function($, _, Backbone, sequencerTemplate) {
  return Backbone.View.extend ({

    template : _.template (sequencerTemplate),

    events : {
      "scroll" : "render"
    },

    initialize : function () {
      _.bindAll (this, "render");
      // The timeline height
      this.timelineHeight = 20;
    },

    offsetX : function () {
      return $(this.el).scrollLeft ();
    },

    render : function () {
      $(this.el).html (this.template ());
      
      // Setting #sequencer dimension
      $(this.el).css ("width", this.getWidth());
      $(this.el).css ("height", this.getHeight());
      $(this.el).css ("margin-left", $("#left-bar").innerWidth ());

      // Setting timeline canvas dimension inside #sequencer
      // var $canvas = $("#timeline-canvas", $(this.el));
      // $canvas.attr("width",  $(this.el).innerWidth ());
      // $canvas.attr("height", $(this.el).innerHeight () - $.getScrollbarWidth ());

      var stage = new Kinetic.Stage ({
        container : "sequencer",
        width : $(this.el).innerWidth (),
        height : $(this.el).innerHeight () - $.getScrollbarWidth ()
      });
      $(".kineticjs-content").css ("position", "fixed");

      var timelineLayer = new Kinetic.Layer ();

      var clipsLayer = new Kinetic.Layer ();

      stage.add (timelineLayer);

      var ctx = timelineLayer.getCanvas ().element.getContext ("2d");//$canvas[0].getContext("2d");
      this.drawTimeline (ctx, this.offsetX());
      return this;
    },

    /* private */
    // Returns the step size of the grid in pixels
    _grid_steps_width: function(step_size) {
      // FIXME !! 100 is the "scale"
      return ((60 / this.model.get("bpm")) * 100) * step_size;
    },

    /**
     *  Draw the timeline with the given offset on the given 2D context 
     */
    drawTimeline : function (ctx, offsetX) {
      var grid_every = 1 / 8
        , ctx_width  = ctx.canvas.width
        , ctx_height = ctx.canvas.height
        , step_width = this._grid_steps_width(grid_every)
        , is_beat    = function(n) {return (n % (1 / grid_every)) == 0;}
        , is_bar     = function(n) {return (n % (4 / grid_every)) == 0;};

      // Filling the top area that will contain timeline numbers
      ctx.fillStyle = '#444';
      ctx.fillRect(0, 0, ctx_width, this.timelineHeight);
      ctx.strokeStyle = "fff";
      ctx.moveTo(0, this.timelineHeight);
      ctx.lineTo(ctx_width, this.timelineHeight);
      ctx.closePath();
      ctx.stroke();
      
      for(var i = (Math.ceil (offsetX / step_width)), 
	  max = (Math.ceil(ctx_width / step_width) + offsetX); 
	  i < max; i++) {
        var x = i * step_width + 1 - offsetX,
        start_y = 0;
        if(is_bar(i)) {
          ctx.strokeStyle = "#fff";
          ctx.fillStyle = "#fff";
          ctx.font = "Arial 30px";
          ctx.fillText((i / (4 / grid_every)) + 1, x + 5, 12);
        }
        else if(is_beat(i)) {
          ctx.strokeStyle = "#bbb";
          ctx.fillStyle = "#ccc";
          ctx.fillText(Math.floor((i / (4 / grid_every)) + 1).toString() + '.' + 
                       (((i / 8) % (4 / grid_every) % 4) + 1), 
                       x + 4, 12);
        }
        else {
          ctx.strokeStyle = "#888";
          start_y = this.timelineHeight;
        }
        
        //console.log(x, 0, x + (step_width - 2), ctx_height);
        ctx.beginPath();
        ctx.moveTo(x, start_y);
        ctx.lineTo(x, ctx_height);
        ctx.closePath();
        ctx.stroke();
      }
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