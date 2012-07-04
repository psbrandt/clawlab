class ClipActionOffsetBegin < ClipAction

  field :offset, :type => Float
  field :old_offset, :type => Float

  def redo
    self.update_attributes!(:old_offset => clip.begin_offset)
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    } << self
    clip.update_attributes!(:begin_offset => offset)
    clip.save!
  end

  def undo
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    }.remove_child!(self)
    clip.update_attributes!(:begin_offset => old_offset)
    clip.save!
  end
end
