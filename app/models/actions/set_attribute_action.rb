module SetAttributeAction
  extend ActiveSupport::Concern

  module ClassMethods
    attr_accessor :item_type, :item_attribute, :action_attribute

    # If a method that looks like `sets_item_type_attribute` is called, we
    # pass it to the sets_attribute method and use the `item_type` as the
    # item type to be used for dynamic item matching
    #
    def method_missing method_name, *args, &block
      if (matches = method_name.to_s.match(/^sets_(\w+?)_attribute$/))
        sets_attribute matches[1].to_sym, *args
      else
        super method_name, *args, &block
      end
    end

    # Defines the parameters used for dynamic redo and undo methods creation
    #
    # @param  [Symbol]  item_type  The kind of item that will be edited
    #
    # @param  [Symbol]  item_attribute  The symbol representing the attribute
    #   of the item to be edited
    #
    # @param  [Hash]    options  The options used to create Moped fields
    #   to store the new and old values of the item attribute
    #
    def sets_attribute item_type, item_attribute, options
      # Remember item type and attribute names to be used in class instance
      @item_type = item_type
      @item_attribute = item_attribute
      @action_attribute = options.delete(:as).presence || item_attribute

      # Declare Mongoid fields to store new and old values for attribute
      field action_attribute, options
      field "old_#{ action_attribute }", options

      # Set parent finders according to item_type
      parent_finders do |action|
        case item_type
        when :track
          %W(track_action_create_#{ action.track_id })
        when :clip
          %W(track_action_create_#{ action.track_id } clip_action_create_#{ action.clip_id })
        else
          []
        end
      end
    end
  end

  # Find item to be edited
  #
  # @param  [SongVersion]  song_version  The song version where the item will be
  #   edited in
  #
  def get_item song_version
    case self.class.item_type
    when :song_version
      song_version
    when :track
      song_version.tracks.find(track_id)
    when :clip
      song_version.tracks.find(track_id).clips.find(clip_id)
    end
  end

  # Update attribute with new value
  #
  # @param  [SongVersion]  song_version  The song version where the item will be
  #   edited in
  #
  def redo song_version
    item = get_item(song_version)
    # Store old attribute value
    self.update_attributes!("old_#{ self.class.action_attribute }" => item.send(self.class.item_attribute))
    # Append action to tree
    append_to_parent(song_version)
    # Set new attribute value
    item.update_attributes!(self.class.item_attribute => self.send(self.class.action_attribute))
    # Return updated item
    item
  end

  # Restore attribute to its previous value
  #
  # @param  [SongVersion]  song_version  The song version where the item will be
  #   edited in
  #
  def undo song_version
    item = get_item(song_version)
    # Remove from tree
    remove_from_parent(song_version)
    # Find clip and restore source offset
    item.update_attributes!(self.class.item_attribute => self.send("old_#{ self.class.action_attribute }"))
    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.send(self.class.action_attribute) == action.send(self.class.action_attribute)
  end
end