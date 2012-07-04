class SongVersionActionSetTitle < SongVersionAction

  field :after, :type => String
  field :before, :type => String

  def redo
    self.update_attributes!(:before => song_version.title)
    song_version.root_action.add_child(self)
    song_version.update_attributes!(:title => after)
    song_version.save!
  end

  def undo 
    song_version.root_action.remove_child!(self)
    song_version.update_attributes!(:title => before)
    song_version.save!
  end
end
