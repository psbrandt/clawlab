/**
 * Action tree view. It renders the root_action of a song_version.
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/action_tree.html",
  "text!templates/action_tree_menu.html",
  "text!templates/action.html",
  "text!templates/action_children.html",
], function($, _, Backbone, actionTreeTemplate, menuTemplate, actionTemplate, 
            actionChildrenTemplate) {
  return Backbone.View.extend ({
    
    id : "action-tree",
    className : "tab-pane",
    // The main template for the action tree
    template : _.template (actionTreeTemplate),
    menuTemplate : _.template (menuTemplate),

    // A common template for actions
    actionTemplate : _.template (actionTemplate),

    // A template for actions children
    childrenTemplate : _.template (actionChildrenTemplate),

    events : {
      "click #root-action-refresh" : "refreshClicked"
    },

    initialize : function () {
      _.bindAll (this, "render");
      
      this.$elMenu = $("<li></li>"); 
      this.elMenu  = this.$elMenu[0];

      this.model.on ("change:root_action", this.render);
    },

    render : function () {
      this.$elMenu.html (this.menuTemplate ());
      
      // Computing root action view
      var root_action = this.template (this.model.get("root_action"));

      // Computing tree view
      var tree = this.renderAction (this.model.get("root_action"), 
                                    this.childrenTemplate ());

      // Concatenate the two views in el
      this.$el.html ($(root_action).add (tree));

      return this;
    },
    
    /**
     * This fonction renders an action. It is recursively called on each 
     * children.
     */
    renderAction : function (action, el) {
      var new_el = $(el).html (this.actionTemplate ({
        pretty_name : action.pretty_name,
        created_at  : action.created_at
      }));
      if (action.children.length > 0) {
        var self = this;
        _.each (action.children, function (child) {
          $(new_el).append (
            self.renderAction(child, self.childrenTemplate (child))
          );
        });
      }
      return new_el;
    },

    refreshClicked : function () {
      this.model.fetchRootAction ();
    }

  });
});