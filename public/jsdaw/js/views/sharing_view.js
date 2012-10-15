/**
 * The view containing sharing features
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/sharing.html",
  "text!templates/sharing_menu.html",
  "text!templates/collaborator.html"
], function($, _, Backbone, sharingTemplate, menuTemplate, collaboratorTemplate) {
  return Backbone.View.extend ({

    className    : "tab-pane",
    id           : "sharing",
    template     : _.template (sharingTemplate),
    menuTemplate : _.template (menuTemplate),

    events : {
      "click .merge-btn" : "mergeClicked",
      "click .share-btn" : "shareSubmitted"
    },
    
    initialize : function () {
      this.$elMenu = $("<li></li>"); 
      this.elMenu  = this.$elMenu[0];      
    },
    
    render : function () {
      this.$el.html (sharingTemplate);
      this.$elMenu.html (menuTemplate);
      var self = this;
      $.get ("/friends.json", function (data) {
        self.$el.find ("input").typeahead ({
          source : _.map (data.friends, function (user) {
            return user.email;
          })
        })
      })
      $.get ("collaborators.json", function (data) {
        _.each (data.users, function (user) {
          self.appendUser (user);
        })
      });

      return this;
    },

    appendUser : function (user) {
      this.$el.find (".collaborators").append (
        _.template (collaboratorTemplate, user)
      )
    },

    shareSubmitted : function () {
      var email = this.$el.find ("input").val ();
      if (email == "") return;
    },

    mergeClicked : function (e) {
      this.model.merge ($(e.target).data ("song-version-id"))
    }
    
  });
});