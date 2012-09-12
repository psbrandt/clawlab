/**
 * Root action model. Embedded in SongVersionModel. 
 * Embeds many children not initialize as models. Not easy to implement
 * recursively embedded Models with Backbone
 */
define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  return Backbone.Model.extend ({
    
    url : "root_action",

    initialize : function (data) {
      this.children = data.children;
      this.pretty_name = data.pretty_name;
      this.created_at = data.created_at;
    }
  });
});