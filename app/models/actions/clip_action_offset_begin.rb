class ClipActionOffsetBegin < ClipAction

  field :offset, :type => Float
  field :old_offset, :type => Float

  def pretty_name
    "Offset begin"
  end

  def redo song_version
    self.update_attributes!(:old_offset => clip.begin_offset)
    song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{track_id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip_id}"
    } << self
    song_version.tracks.find(track_id).clips.find(clip_id).update_attributes!(:begin_offset => offset)
  end

  def undo song_version
    song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{track_id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip_id}"
    }.remove_child!(self)
    song_version.tracks.find(track_id).clips.find(clip_id).update_attributes!(:begin_offset => old_offset)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.offset == action.offset
  end

end
