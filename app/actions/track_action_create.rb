class TrackActionCreate < TrackAction

  field :params, :type => Hash, :default => {}

  def name
    "track_action_create_#{track_id}"
  end

  def redo
    t = Track.new(params)
    song_version.tracks << t
    song_version.root_action << self
    self.track = t
  end

  def undo
    song_version.root_action.remove_child!(self)
    song_version.tracks.delete(track)
    song_version.save!

    # undoing children (dependant actions)
    children.each &:undo
  end
end
