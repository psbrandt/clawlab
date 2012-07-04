class TrackActionSetName < TrackAction

  field :after, :type => String
  field :before, :type => String

  def redo
    self.update_attributes!(:before => track.name)
    track.song_version.root_action.
      children["track_action_create_#{track.id}"] << self
    track.update_attributes!(:name => after)
    track.save!
  end

  def undo
    track.song_version.root_action.remove_child!(self)
    track.update_attributes!(:name => before)
    track.save!
  end
end
