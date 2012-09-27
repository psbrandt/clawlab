class ClipActionOffsetSource < ClipAction

  field :offset, :type => Float
  field :old_offset, :type => Float

  def pretty_name
    "Move"
  end

  def redo
    self.update_attributes!(:old_offset => clip.source_offset)
    song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.detect { |a|
      a.name == "clip_action_create_#{clip.id}"
    } << self
    clip.update_attributes!(:source_offset => offset)
  end

  def undo
    song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    }.remove_child!(self)
    clip.update_attributes!(:source_offset => old_offset)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.offset == action.offset
  end

end
