class ClipActionCreate < ClipAction

  field :params, :type => Hash, :default => {}

  def name
    i = params["clip_id"] if params
    "clip_action_create_#{i}"
  end

  def redo
    c = Clip.new params
    track.clips << c

    # storing the clip id
    self.params["clip_id"] = c.id

    # adding self in action tree
    logger.info track.song_version.root_action.children
    logger.info "track_action_create_#{track_id}"
    track.song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    } << self
  end

  def undo
    track.clips.delete(clip)

    # removing self from action tree
    track.song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }.remove_child!(self)

    # undoing children (dependant actions)
    children.each &:undo
  end
end
