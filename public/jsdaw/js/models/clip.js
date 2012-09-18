define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  var ClipModel = Backbone.Model.extend ({
    
    //Setting the id to match Mongoid ids
    idAttribute : "_id", 

    delete : function () {
      this.destroy ();
    }

  });
  return ClipModel;
});