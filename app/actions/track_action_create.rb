class TrackActionCreate < TrackAction

  belongs_to :song_version

  field :params, :type => Hash

  def redo
    t = Track.new(params)
    song_version.tracks << t
    self.track = t
    song_version.root_action << self
  end

  def undo
    song_version.root_action.remove_child!(self)
    song_version.tracks.delete(track)
    song_version.save!
  end
end
