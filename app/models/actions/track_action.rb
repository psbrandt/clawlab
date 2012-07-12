class TrackAction < Action
  belongs_to :song_version
  field :track_id, :type => BSON::ObjectId
end
