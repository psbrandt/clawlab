/**
 * Action model
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "collections/action_collection"
], function($, _, Backbone, ActionCollection) {
  var ActionModel = Backbone.Model.extend ({
    
    initialize : function (data) {
      this.children = new ActionCollection ();
    },

    addChild : function (action) {
      this.children.add (action);
    }
  });
  
  return ActionModel;
});