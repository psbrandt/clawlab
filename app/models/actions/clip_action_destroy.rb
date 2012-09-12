class ClipActionDestroy < ClipAction

  def pretty_name
    "Delete clip"
  end

  def redo
    clip.track.song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.detect { |a|
      a.name == "clip_action_create_#{clip.id}"
    }.remove_child!(self)
    clip.delete
  end

  def undo
    clip.track.clips << clip
    clip.track.song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.detect { |a|
      a.name == "clip_action_create_#{clip.id}"
    } << self

    # undoing children (dependant actions)
    children.each &:undo
  end

end
