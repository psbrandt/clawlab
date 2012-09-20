define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  var ClipModel = Backbone.Model.extend ({
    
    //Setting the id to match Mongoid ids
    idAttribute : "_id", 

    defaults : {
      source_offset : 0,
      begin_offset  : 0,
      end_offset    : 0
    },

    initialize : function (data) {
    },

    delete : function () {
      this.destroy ();
    }

  });
  return ClipModel;
});