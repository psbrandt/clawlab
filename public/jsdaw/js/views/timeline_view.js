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

    events : {
      "click #tracker" : "trackerClicked"
    },

    /** if modifier keys pressed, set region points else pause song, set 
      * playingAt position, and playback if the song was playing */
    trackerClicked : function (e) {
      if (e.metaKey) {
	this.model.set (
	  "regionEnd",
	  Claw.Helpers.pxToSec (e.offsetX + this.model.get ("scrollLeft"))
	);
	return;
      }
      if (e.altKey) {
	this.model.set (
	  "regionBegin",
	  Claw.Helpers.pxToSec (e.offsetX + this.model.get ("scrollLeft"))
	);
	return;
      }
      // Do nothing if click happenned outside the top of timeline
      if (e.offsetY > this.model.get ("timelineHeight")) return;
      var wasPlaying = this.model.get ("playing");
      this.model.pause ();
      this.model.set (
        "playingAt", 
        Claw.Helpers.pxToSec (e.offsetX + this.model.get ("scrollLeft"))
      );
      if (wasPlaying) this.model.play ();
    },

    initialize : function () {      
      this.model.on ("change:scrollLeft", function (model, scrollLeft) {
        this.drawTimeline (scrollLeft);
        this.drawTracker  (scrollLeft, model.get ("playingAt"));
	this.drawRegion   (scrollLeft, model.get ("regionBegin"), 
			   model.get ("regionEnd"));
      }, this)
      this.model.on ("change:playingAt", function (model, playingAt) {
        this.drawTracker  (model.get ("scrollLeft"), playingAt);
      }, this);
      this.model.on ("change:regionBegin change:regionEnd", this.regionChanged,
		     this);
    },

    render : function () {
      this.$el.html (this.template);

      // Setting canvases size
      $("canvas", this.el).attr ({
        width : this.$el.width (),
        height : this.$el.height ()
      });

      var scrollLeft = this.model.get ("scrollLeft");
      this.drawTimeline (scrollLeft);
      this.drawTracker  (scrollLeft, this.model.get ("playingAt"));
      this.drawRegion   (scrollLeft, this.model.get ("regionBegin"), 
			 this.model.get ("regionEnd"));
      return this;
    },

    regionChanged : function (model) {
      this.drawRegion (
	model.get ("scrollLeft"), 
	model.get ("regionBegin"), 
	model.get ("regionEnd")
      );
    },

    drawRegion : function (offset, start, end) {
      ctx = this.$el.find ("#selectedRegion")[0].getContext ("2d")
        , ctxHeight = ctx.canvas.height
        , ctxWidth  = ctx.canvas.width;
      
      var x1 = Claw.Helpers.secToPx (start) - offset;
      var x2 = Claw.Helpers.secToPx (end) - offset;
      // Clear canvas
      ctx.clearRect(0, 0, ctxWidth, ctxHeight);
      
      // return if both points are not visible
      if ((x1 < 0 && x2 < 0) || (x1 > ctxWidth && x2 > ctxWidth)) return;

      ctx.beginPath ();
      ctx.rect (x1, 0, x2 - x1, ctxHeight + 1);
      ctx.fillStyle = "rgba(0, 86, 154, 0.1)";
      ctx.fill ();
      ctx.strokeStyle = "#2F96FF";
      ctx.stroke ();
      
      // Draw two little squares on top
      var side = 5;
      ctx.fillStyle = "#2F96FF";
      ctx.fillRect (x1, 0, side, side);
      ctx.fillRect (x2 - side, 0, side, side);
    },

    drawTracker : function (offset, playingAt) {
      ctx = this.$el.find ("#tracker")[0].getContext ("2d")
        , ctxHeight = ctx.canvas.height
        , ctxWidth  = ctx.canvas.width
      
      var x = Claw.Helpers.secToPx (playingAt) - offset;
      // Clear canvas
      ctx.clearRect(0, 0, ctxWidth, ctxHeight);

      // Return if the tracker is not visible
      if (x < 0 || x > ctxWidth) return;

      ctx.beginPath ();
      ctx.moveTo (x, 0);
      ctx.lineTo (x, ctxHeight);
      ctx.strokeStyle = "red";
      ctx.stroke ();      
    },

    /**
     * Draw the timeline (numbers at the top) with the given offset on the 
     * given 2D context */
    drawTimeline : function (offsetX) {
      var grid_every = 1/8,
      ctx = this.$el.find ("#timeline")[0].getContext ("2d")
        , ctxWidth  = ctx.canvas.width
        , ctxHeight = ctx.canvas.height
        , stepWidth = Claw.Helpers.beatsToPx (grid_every)
        , is_beat    = function(n) {return (n % (1 / grid_every)) == 0;}
        , is_bar     = function(n) {return (n % (4 / grid_every)) == 0;};

      // Clear canvas
      ctx.clearRect(0, 0, ctxWidth, ctxHeight);

      // Filling the top area that will contain timeline numbers
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, ctxWidth, this.model.get ("timelineHeight") - 1);
      
      for(var i = (Math.ceil (offsetX / stepWidth)), 
	  max = (Math.ceil(ctxWidth / stepWidth) + offsetX); 
	  i < max; i++) {
        var x = i * stepWidth - offsetX
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
        ctx.lineTo(x, ctxHeight);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.fillStyle = "";
      ctx.closePath ();
    }

  });
});