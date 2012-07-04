class ClipActionDestroy < ClipAction

  def redo
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    }.remove_child!(self)
    clip.destroy!
  end

  def undo
    clip.track.clips << clip
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    } << self
  end
end
