class TrackAction < Action
  field :song_version_id, :type => Moped::BSON::ObjectId
  field :track_id,        :type => Moped::BSON::ObjectId

  def same_as? action
    super(action) && self.track_id == action.track_id
  end
end
