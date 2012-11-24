class TrackActionCreate < TrackAction

  field :params, :type => Hash, :default => {}

  def pretty_name
    "Create track"
  end

  def name
    i = params["id"] if params
    "track_action_create_#{i}"
  end

  def redo song_version
    # Create new track from params
    track = song_version.tracks.create params
    # Storing the id in params to recreate the exact same track when redoing
    params["id"] = track.id
    # Append action to tree
    append_to_parent(song_version)
    # Return track
    track
  end

  def undo song_version
    # What ?
    song_version = SongVersion.find(song_version_id)
    # Find track, why do we use self.params['id'] ?
    song_version.tracks.find(self.params["id"]).delete
    # Remove action from track
    remove_from_parent(song_version)
    # undoing children (dependent actions)
    children.each &:undo
  end

  def same_as? action
    # not calling super because self.clip is nil
    self.class == action.class && self.params["id"] == action.params["id"]
  end
end
