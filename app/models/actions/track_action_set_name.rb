class TrackActionSetName < TrackAction

  field :name, :type => String
  field :old_name, :type => String

  def pretty_name
    "Set name #{name}"
  end

  def redo song_version
    track = song_version.tracks.find(track_id)
    self.update_attributes!(:old_name => track.name)
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    } << self
    track.update_attributes!(:name => name)
    track
  end

  def undo song_version
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }.remove_child!(self)
    song_version.tracks.find(track_id).update_attributes!(:name => old_name)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.name = action.name
  end
end
