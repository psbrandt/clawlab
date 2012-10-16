/**
 * The view containing sharing features
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "models/song_version",
  "text!templates/sharing.html",
  "text!templates/sharing_menu.html",
  "text!templates/collaborator.html"
], function($, _, Backbone, SongVersion, sharingTemplate, menuTemplate, 
            collaboratorTemplate) {
  return Backbone.View.extend ({

    className    : "tab-pane",
    id           : "sharing",
    template     : _.template (sharingTemplate),
    menuTemplate : _.template (menuTemplate),

    events : {
      "click .merge-btn" : "mergeClicked",
      "click .share-btn" : "shareSubmitted",
      "click .toggle-ghost-btn"  : "toggleGhostClicked"
    },
    
    initialize : function () {
      this.$elMenu = $("<li></li>"); 
      this.elMenu  = this.$elMenu[0];      
    },
    
    render : function () {
      this.$elMenu.html (menuTemplate);
      this.$el.html (sharingTemplate);
      var self = this;
      _.each (this.model.get ("collaborators"), function (user) {
        self.appendCollaborator (user);
      });
      this.appendRequests (this.model.get ("requests"))

      $.get ("/friends.json", function (data) {
        self.$el.find ("input").typeahead ({
          source : _.map (data.friends, function (user) {
            return user.email;
          })
        })
      })
      return this;
    },

    appendCollaborator : function (user) {
      this.$el.find (".collaborators").append (
        _.template (collaboratorTemplate, user)
      )
    },

    shareSubmitted : function () {
      var email = this.$el.find ("input").val ();
      if (email == "") return;
      $.post ("share.json", { "user[email]" : email }, function (data) {

      })
    },

    /* Take an array of JSON requests and append it to the view */
    appendRequests : function (requests) {
      this.$el.find (".pending-requests").html (
        requests.length + " pending request" + ((requests.length > 1)?"s":"")
      );
    },

    mergeClicked : function (e) {
      this.model.merge ($(e.currentTarget).data ("song-version-id"))
    },

    toggleGhostClicked : function (e) {
      var id = $(e.currentTarget).data ("song-version-id");
      var ghost = this.model.get ("ghost");

      if (ghost && ghost.get("_id") == id) {
        this.model.unset ("ghost");
        return;
      }
      var self = this;
      new SongVersion ({id : id}).fetch ({ 
        success : function (model, json) {
          self.model.set ("ghost", new SongVersion (json));
        }
      });
    }
    
  });
});