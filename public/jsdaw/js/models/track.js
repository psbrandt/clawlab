define([
  "jquery",
  "underscore",
  "backbone",
], function($, _, Backbone) {
  var TrackModel = Backbone.Model.extend ({
    
    //Setting the id to match Mongoid ids
    idAttribute : "_id", 

    defaults : {
      name : "New track",
      volume : 0
    },

    delete : function () {
      this.destroy ();
    }
  });
  return TrackModel;
});