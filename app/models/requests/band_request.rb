class BandRequest < Request
  
  belongs_to :band

  def accept
    receiver.bands << band
  end

end
