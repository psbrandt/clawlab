/**
 * Collection for audio tracks
 *
 * @file        Collections.Tracks.js
 * @author      Jan Myler <honza.myler[at]gmail.com>, Gabriel Cardoso
 * @copyright   Copyright 2012, Jan Myler (http://janmyler.com)
 * @license     MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 */

define([
  "jquery",
  "underscore",
  "backbone",
  "models/track"
], function($, _, Backbone, TrackModel) {

  return Backbone.Collection.extend ({
    model : TrackModel,

    url : "tracks",

    initialize : function (models) {
      this.indexCount = 0;
      _.bindAll(this, 'incIndexCount');
      this.bind('add', this.incIndexCount);
    },

    incIndexCount: function() {
      this.indexCount++;
    },

    decIndexCount: function() {
      this.indexCount--;
    },

    getIndexCount: function() {
      return this.indexCount;
    }
  });

});