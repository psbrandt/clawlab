define([
  "jquery",
  "underscore",
  "backbone",
  "router",
  "models/song_version",
  "views/song_version_view",
  "libs/helpers",
  "libs/player",
  "views/transport_view",
  "views/menu_bar_view"
], function ($, _, Backbone, Router, SongVersionModel, SongVersionView, 
             Helpers, Player, TransportView, MenuBarView) {

  var initialize = function(clawData){
    // Pass in our Router module and call it's initialize function
    //Router.initialize();

    Claw = {};

    // Create a song version model
    var songVersionModel = new SongVersionModel (clawData.currentSongVersion);

    //Huh put it in Helpers maybe
    window.authenticityToken = clawData.authenticityToken;

    Claw.Helpers = new Helpers ({
      bpm : songVersionModel.get("bpm"),
      pxPerBeat : songVersionModel.get ("scale")
    });

    // Render the menu bar view
    new MenuBarView({
      model : songVersionModel
    }).render ();

    // Render the transport view
    new TransportView({
      model : songVersionModel
    }).render ();

    Claw.Player = new Player (songVersionModel)
    // Render the song version
    new SongVersionView ({
      model : songVersionModel,
      el : "#main"
    }).render ();

    window.Claw = Claw;
  };

  return {
    initialize: initialize
  };

});