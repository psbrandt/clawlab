class ClipActionCreate < ClipAction
  field :params, :type => Hash, :default => {}

  parent_finders do |action|
    %W(track_action_create_#{ action.track_id })
  end

  def name
    i = params["id"] if params
    "clip_action_create_#{i}"
  end

  def pretty_name
    "Create clip"
  end

  def redo song_version
    # Find track and build clip
    clip = song_version.tracks.find(track_id).clips.create params
    # storing the id in params to recreate the exact same clip when redoing
    self.params["id"] = clip.id
    # adding self in action tree
    append_to_parent(song_version)
    # Return created clip
    clip
  end

  def undo song_version
    # Delete clip from track
    song_version.tracks.find(track_id).clips.delete(clip)
    # Remove from tree
    remove_from_parent(song_version)
    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    # not calling super because self.clip is nil
    self.class == action.class && self.params["id"] == action.params["id"]
  end

end
