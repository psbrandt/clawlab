class ClipAction < Action
  field :track_id, :type => Moped::BSON::ObjectId
  field :clip_id, :type => Moped::BSON::ObjectId

  def same_as? action
    super(action) && self.clip_id == action.clip_id
  end

end
