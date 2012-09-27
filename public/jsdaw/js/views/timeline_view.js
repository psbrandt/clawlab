/**
 * Timeline view and tracker
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/timeline.html"
], function($, _, Backbone, timelineTemplate) {
  return Backbone.View.extend ({
    
    template : timelineTemplate,

    initialize : function () {      
      this.model.on ("change:scrollLeft", function (model, scrollLeft) {
        this.drawTimeline (scrollLeft);
        this.drawTracker  (scrollLeft, model.get ("playingAt"));
      }, this)
      this.model.on ("change:playingAt", function (model, playingAt) {
        this.drawTracker  (model.get ("scrollLeft"), playingAt);
      }, this)
    },

    render : function () {
      this.$el.html (this.template);

      // Setting canvases size
      $("canvas", this.el).attr ({
        width : this.$el.width (),
        height : this.$el.height ()
      });

      this.drawTimeline (0);
      this.drawTracker  (0, 0);
      
      return this;
    },

    drawTracker : function (offset, playingAt) {
      ctx = this.$el.find ("#tracker")[0].getContext ("2d")
        , ctx_height = ctx.canvas.height
        , ctx_width  = ctx.canvas.width
      
      var x = Claw.Helpers.secToPx (playingAt) - offset;
      // Clear canvas
      ctx.clearRect(0, 0, ctx_width, ctx_height);
      if (x < 0 || x > ctx_width) return;
      ctx.beginPath ();
      ctx.moveTo (x, 0);
      ctx.lineTo (x, ctx_height);
      ctx.strokeStyle = "red";
      ctx.stroke ();
      
    },

    /**
     * Draw the timeline (numbers at the top) with the given offset on the 
     * given 2D context */
    drawTimeline : function (offsetX) {
      var grid_every = 1/8,
      ctx = this.$el.find ("#timeline")[0].getContext ("2d")
        , ctx_width  = ctx.canvas.width
        , ctx_height = ctx.canvas.height
        , step_width = Claw.Helpers.beatsToPx (grid_every)
        , is_beat    = function(n) {return (n % (1 / grid_every)) == 0;}
        , is_bar     = function(n) {return (n % (4 / grid_every)) == 0;};

      // Clear canvas
      ctx.clearRect(0, 0, ctx_width, ctx_height);

      // Filling the top area that will contain timeline numbers
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, ctx_width, this.model.get ("timelineHeight") - 1);
      
      for(var i = (Math.ceil (offsetX / step_width)), 
	  max = (Math.ceil(ctx_width / step_width) + offsetX); 
	  i < max; i++) {
        var x = i * step_width + 1 - offsetX
        // by default, will draw a vertical line under the numbers
        var start_y = this.model.get ("timelineHeight");
        if(is_bar(i)) {
          start_y = 0;
          ctx.strokeStyle = "#fff";
          ctx.fillStyle = "#fff";
          ctx.font = "Arial 30px";
          ctx.fillText((i / (4 / grid_every)) + 1, x + 5, 12);
        }
        else if(is_beat(i)) {
          start_y = 0;
          ctx.strokeStyle = "#bbb";
          ctx.fillStyle = "#ccc";
          ctx.fillText(Math.floor((i / (4 / grid_every)) + 1).toString() + '.' + 
                       (((i / 8) % (4 / grid_every) % 4) + 1), 
                       x + 4, 12);
        }
        else {
          ctx.strokeStyle = "#888";
        }
        ctx.beginPath();
        ctx.moveTo(x, start_y);
        ctx.lineTo(x, ctx_height);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.fillStyle = "";
      ctx.closePath ();
    }

  });
});