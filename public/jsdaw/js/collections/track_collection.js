define([
  "jquery",
  "underscore",
  "backbone",
  "models/track"
], function($, _, Backbone, TrackModel) {

  return Backbone.Collection.extend ({
    model : TrackModel,
    url : "tracks",

    initialize : function () {
      this.indexCount = 0;
      _.bindAll(this, 'incIndexCount');
      this.bind('add', this.incIndexCount);
    },

    incIndexCount: function() {
      this.indexCount += 1;
    },

    decIndexCount: function() {
      this.indexCount -= 1;
    },

    getIndexCount: function() {
      return this.indexCount;
    }
  });

});