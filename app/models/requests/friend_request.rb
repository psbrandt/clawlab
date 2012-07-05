class FriendRequest < Request
  
  def accept
    sender.friends << receiver
    receiver.friends << sender
  end

end
