define([
  "jquery",
  "underscore",
  "backbone"
], function($, _, Backbone) {
  var ChatModel = Backbone.Model.extend ({
    
    initialize : function (data) {
      this.client = new Faye.Client (
        "http://localhost:8000/faye/" + data.songVersionId, {
          timeout :  120
        });
      var self = this;
      
      // Subscribing to incomming chat messages. Triggering newMessage event
      this.client.subscribe (
        "/chat/messages", 
        function (message) {
          self.trigger ("newMessage", message);
        })

      // Subscribing to incomming information. Triggering newInfo event
      this.client.subscribe (
        "/chat/info", 
        function (message) {
          self.trigger ("newInfo", message);
        })
      
      // Binding up and down event 
      this.client.bind ("transport:up", function () {
        self.send ("info", "is online");
      })
      this.client.bind ("transport:down", function () {
        self.send ("info", "seems offline");
      })
    },
    
    send : function (channel, text) {
      var self = this;
      self.client.publish ("/chat/" + channel, {
        userName : this.get("user").name,
        time : new Date().getTime(),
        text : text
      });
    },      

    sendMessage : function (text) {
      this.send ("messages", text);
    }

  });
  return ChatModel;
});