class ClipActionCreate < ClipAction

  field :params, :type => Hash, :default => {}

  def name
    i = params["id"] if params
    "clip_action_create_#{i}"
  end

  def pretty_name
    "Create clip"
  end

  def redo song_version
    c = Clip.new params
    song_version.tracks.find(track_id).clips << c

    # storing the id in params to recreate the exact same clip when redoing
    self.params["id"] = c.id

    # adding self in action tree
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    } << self
    c
  end

  def undo song_version
    song_version.tracks.find(track_id).clips.delete(clip)

    # removing self from action tree
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }.remove_child!(self)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    # not calling super because self.clip is nil
    self.class == action.class && self.params["id"] == action.params["id"]
  end

end
