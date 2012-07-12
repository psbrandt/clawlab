class TrackActionCreate < TrackAction

  field :params, :type => Hash, :default => {}

  def name
    "track_action_create_#{track_id}"
  end

  def redo
    t = Track.new params
    song_version.tracks << t
    self.params["track_id"] = t.id
    song_version.root_action << self
  end

  def undo
    song_version.tracks.find(self.params["track_id"]).delete
    song_version.root_action.remove_child!(self)

    # undoing children (dependant actions)
    children.each &:undo
  end
end
