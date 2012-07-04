class TrackActionDestroy < TrackAction

  def redo
    track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{track.id}"
    }.remove_child!(self)
    track.destroy!
  end

  def undo
    track.song_version.tracks << track
    track.song_version.root_action.children.find { |a|
      a.name == "track_action_create_#{track.id}"
    } << self
  end
end
