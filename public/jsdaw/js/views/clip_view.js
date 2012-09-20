/**
 * Clip View
 */
define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  return Backbone.View.extend ({

    initialize : function () {
      this.kineticNode = new Kinetic.Rect ({
        x : Claw.Helpers.secToPx (this.model.get ("source_offset")),
        y : 0,
        width : 100, // TODO Web Audio API compute length
        height : 75,
        fill : "black",
        draggable : true,
        dragConstraint : "horizontal",
        dragBounds : {
          left:1
        }
      })
      var self = this;
      this.kineticNode.on ("dragend", function (e) {
        self.dragStopped (e);
      });
    },

    // renders in the sequencer view
    render : function () {
      return this;
    },

    dragStopped : function (e) {
      console.log (e.shape.getX (), Claw.Helpers.pxToSec (e.shape.getX()));
      // this.model.save ({
      //   source_offset : Claw.Helpers.pxToSec (e.shape.getX())
      // });
    }

  });
});