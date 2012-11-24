class TrackActionSetVolume < TrackAction
  include SetAttributeAction

  sets_track_attribute :volume, :type => Float

  def pretty_name
    "Set volume #{volume}"
  end
end
