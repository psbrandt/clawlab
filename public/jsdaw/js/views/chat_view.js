/**
 * Chat view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/chat.html",
  "text!templates/chat_menu.html",
  "text!templates/chat_message.html",
  "text!templates/chat_info.html"
], function($, _, Backbone, chatTemplate, menuTemplate, messageTemplate, 
            infoTemplate) {
  return Backbone.View.extend ({
    
    className    : "tab-pane",
    id           : "chat",
    template     : _.template (chatTemplate),
    menuTemplate : _.template (menuTemplate),
    msgTemplate  : _.template (messageTemplate),
    infoTemplate : _.template (infoTemplate),

    events : {
      "keypress .input-message" : "keyPressed",
      "click .send-btn"         : "sendMessage"
    },

    initialize : function () {
      this.$elMenu = $("<li></li>"); 
      this.elMenu  = this.$elMenu[0];

      this.model.on ("newMessage newInfo", this.setUnread, this);
      this.model.on ("newMessage", this.appendMessage, this);
      this.model.on ("newInfo", this.appendInfo, this);
    },

    render : function () {
      this.$el.html (this.template);
      this.$elMenu.html (this.menuTemplate);

      this.$elMenu.on ("click", function (e) { $(this).removeClass ("unread") });
      return this;
    },

    setUnread : function () {
      this.$elMenu.addClass ("unread");
    },

    setRead : function () {
      this.$elMenu.removeClass ("unread");
    },
    
    appendMessage : function (msg) {
      var date = new Date (msg.time);
      var hours = date.getHours ();
      var minutes = date.getMinutes ();
      msg.time = hours + ":" + ((minutes < 10) ? "0" + minutes : minutes);
      this.$el.find (".messages").append (this.msgTemplate (msg));
    },

    appendInfo : function (msg) {
      var date = new Date (msg.time);
      var hours = date.getHours ();
      var minutes = date.getMinutes ();
      msg.time = hours + ":" + ((minutes < 10) ? "0" + minutes : minutes);
      this.$el.find (".messages").append (this.infoTemplate (msg));
    },

    keyPressed : function (e) {
      if (e.which == 13) {
        this.sendMessage (e);
        return false;
      }
    },

    sendMessage : function (e) {
      var content = this.$el.find(".input-message").val ()
      if (content == "") return;
      this.model.sendMessage (content)
      this.$el.find (".input-message").val("");
    }
  });
});