define([
  "jquery",
  "underscore",
  "backbone",
  "models/track"
], function($, _, Backbone, TrackModel) {

  return Backbone.Collection.extend ({
    model : TrackModel,
    url : "tracks"
  });

});