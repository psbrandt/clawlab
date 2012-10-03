class TrackAction < Action
  field :song_version_id, :type => Moped::BSON::ObjectId
  field :track_id,        :type => Moped::BSON::ObjectId

  def song_version
    SongVersion.find self.song_version_id
  end

  def track
    song_version.tracks.find self.track_id
  end

  def same_as? action
    super(action) && self.track_id == action.track_id
  end
end
