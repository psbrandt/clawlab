class ClipActionDestroy < ClipAction

  def pretty_name
    "Delete clip"
  end

  def redo song_version
    song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{track_id}"
    }.children.detect { |a|
      a.name == "clip_action_create_#{clip_id}"
    }.remove_child!(self)
    song_version.tracks.find(track_id).clips.find(clip_id).delete
  end

  def undo song_version
    song_version.tracks.find(track_id).clips << clip
    song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{track_id}"
    }.children.detect { |a|
      a.name == "clip_action_create_#{clip_id}"
    } << self

    # undoing children (dependant actions)
    children.each &:undo
  end

end
