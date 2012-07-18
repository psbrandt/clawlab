class FriendRequest < Request

  validates_uniqueness_of :receiver
  
  # When accepted, add friendship between users
  def accepted
    sender.friends << receiver
    receiver.friends << sender
  end

end
