class TrackActionCreate < TrackAction

  field :params, :type => Hash, :default => {}

  def name
    i = params["id"] if params
    "track_action_create_#{i}"
  end

  def redo
    t = Track.new params
    song_version = SongVersion.find(song_version_id)

    song_version.tracks << t

    # storing the id in params to recreate the exact same track when redoing
    params["id"] = t.id

    song_version.root_action << self
  end

  def undo
    song_version = SongVersion.find(song_version_id)

    song_version.tracks.find(self.params["id"]).delete
    song_version.root_action.remove_child!(self)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    # not calling super because self.clip is nil 
    self.class == action.class && self.params["id"] == action.params["id"]
  end
end
