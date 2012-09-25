define([
  "jquery",
  "underscore",
  "backbone",
  "router",
  "models/song_version",
  "views/song_version_view",
  "libs/helpers",
  "views/sequencer_view",
  "libs/player",
  "views/transport_view"
], function (
  $, _, Backbone, Router, SongVersionModel, SongVersionView, Helpers, 
  SequencerView, Player, TransportView) {

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

      // Render the transport view
    new TransportView({
      model : songVersionModel
    }).render ();


    Claw.Player = new Player (songVersionModel)
      // Render the song version
    new SongVersionView ({
      el : "#main",
      model : songVersionModel
    }).render ();

    window.Claw = Claw;
  };

  return {
    initialize: initialize
  };

});