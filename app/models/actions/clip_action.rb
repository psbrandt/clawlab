class ClipAction < Action
  belongs_to :track
  belongs_to :clip
  # field :track_id, :type => BSON::ObjectId
  # field :clip_id,  :type => BSON::ObjectId
end
