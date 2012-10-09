class SongVersionActionSetTitle < SongVersionAction

  field :title, :type => String
  field :old_title, :type => String

  def pretty_name
    "Set title #{title}"
  end

  def redo song_version
    logger.info song_version.as_document
    self.update_attributes!(:old_title => song_version.title)
    song_version.root_action.add_child(self)
    song_version.update_attributes!(:title => title)
  end

  def undo song_version
    song_version.root_action.remove_child!(self)
    song_version.update_attributes!(:title => old_title)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.title == action.title
  end
end
