class TrackActionSetVolume < TrackAction

  field :volume, :type => Float
  field :old_volume, :type => Float

  def pretty_name
    "Set volume #{volume}"
  end

  def redo song_version
    track = song_version.tracks.find(track_id)
    self.update_attributes!(:old_volume => track.volume)
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    } << self
    track.update_attributes!(:volume => volume)
    track
  end

  def undo song_version
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }.remove_child!(self)
    song_version.tracks.find(track_id).update_attributes!(:volume => old_volume)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.volume = action.volume
  end
end
