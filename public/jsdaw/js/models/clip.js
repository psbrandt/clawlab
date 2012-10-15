define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  var ClipModel = Backbone.Model.extend ({
    
    //Setting the id to match Mongoid ids
    idAttribute : "_id", 

    // FIXME : Ugly, should be set in the collection !
    url : function () {
      var url = "tracks/" + this.get ("track_id") + "/clips";
      if (this.id) url += "/" + this.id;
      return url;      
    },
    
    defaults : {
      source_offset : 0,
      begin_offset  : 0,
      end_offset    : 0,
      selected      : false
    },

    validate : function (attrs) {
      if (typeof attrs.begin_offset  !== "number" ||
          typeof attrs.source_offset !== "number" ||
          typeof attrs.end_offset    !== "number")
        return "Offsets must be of type number";
      if (attrs.begin_offset < 0) return "Begin offset can not be negative";
      if (attrs.end_offset   < 0) return "End offset can not be negative";
    }

  });
  return ClipModel;
});