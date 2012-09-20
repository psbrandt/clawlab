class ClipActionCreate < ClipAction

  field :params, :type => Hash, :default => {}

  def name
    i = params["id"] if params
    "clip_action_create_#{i}"
  end

  def pretty_name
    "Create clip"
  end

  def redo
    c = Clip.new params
    track.clips << c

    # storing the id in params to recreate the exact same clip when redoing
    self.params["id"] = c.id

    # adding self in action tree
    track.song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track.id}"
    } << self
  end

  def undo
    track.clips.delete(clip)

    # removing self from action tree
    track.song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track.id}"
    }.remove_child!(self)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    # not calling super because self.clip is nil
    self.class == action.class && self.params["id"] == action.params["id"]
  end

end
