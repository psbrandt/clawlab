# Invite a user to join a band
class BandRequest < Request
  
  belongs_to :band

  validates_presence_of :band

  # When accepted, add receiver to band
  def accepted
    receiver.bands << band
  end

end
