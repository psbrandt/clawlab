class ClipAction < Action
  # Hm... not good. Mongoid says that "Definitions are required on both sides to
  # the relation in order for it to work properly." which is not the case here.
  belongs_to :track
  belongs_to :clip
  # field :track_id, :type => BSON::ObjectId
  # field :clip_id,  :type => BSON::ObjectId

  def same_as? action
    super(action) && self.clip == action.clip
  end

end
