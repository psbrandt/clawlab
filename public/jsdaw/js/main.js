require.config({

  urlArgs: "no-cache=" + (new Date()).getTime(),

  paths: {
    // Major libraries
    jquery: "libs/jquery-1.8.2",
    underscore: "libs/underscore/underscore-min", // https://github.com/amdjs
    backbone: "libs/backbone/backbone-min", // https://github.com/amdjs
    bootstrap : "libs/bootstrap",

    // File uplaod
    fileupload: "libs/fileupload",

    // Helpers
    helpers: "libs/helpers",

    waveform : "libs/waveform-chrome",

    recorder : "libs/recorderjs/recorder",

    // Moustrap dir for key
    "mousetrap-core" : "libs/mousetrap/mousetrap.min",
    "mousetrap-bind" : "libs/mousetrap/mousetrap-bind.min",
    "mousetrap-pause" : "libs/mousetrap/mousetrap-pause.min",

    // Require.js plugins
    text: "libs/require/text",
    order: "libs/require/order",

    // A jQuery plugin to get scrollbar width
    getscrollbarwidth : "libs/jquery.getscrollbarwidth",

    // A custom version of jQ-ui with draggable and droppable only
    jqueryui : "libs/jquery-ui-1.9.0.custom",

    // Just a short cut so we can put our html outside the js dir
    // When you have HTML/CSS designers this aids in keeping them out of the js directory
    templates: "../templates"
  }
});

// Let's kick off the application

require([
  "app",
  "mousetrap-core",
  "bootstrap"
], function(App){
  App.initialize (window.clawData);
});
