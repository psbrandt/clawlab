define([
  "jquery",
  "underscore",
  "backbone",
  "router",
  "models/song_version",
  "views/transport"
], function($, _, Backbone, Router, SongVersionModel, transportView){
  var initialize = function(clawData){
    // Pass in our Router module and call it's initialize function
    Router.initialize();
    
    var songVersionModel = new SongVersionModel (clawData.currentSongVersion);
    new transportView({
      model : songVersionModel
    }).render ();
  }

  return {
    initialize: initialize
  };
});