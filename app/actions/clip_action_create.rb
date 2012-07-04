class ClipActionCreate < ClipAction

  field :params, :type => Hash, :default => {}

  def name
    "clip_action_create_#{clip_id}"
  end

  def redo
    t = Clip.new(params)
    track.clips << t
    track.song_version.root_action.children.find { |a|
      a.name == "track_action_create_#{track.id}"
    } << self
    self.clip = t
  end

  def undo
    track.song_version.root_action.children.find { |a|
      a.name == "track_action_create_#{track.id}"
    }.remove_child!(self)
    song_version.clips.delete(clip)
    song_version.save!
  end
end
