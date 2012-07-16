class TrackAction < Action
  field :song_version_id, :type => BSON::ObjectId
  field :track_id,        :type => BSON::ObjectId
end
