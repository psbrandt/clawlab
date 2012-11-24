class TrackActionSetName < TrackAction
  include SetAttributeAction

  sets_track_attribute :name, :type => String

  def pretty_name
    "Set name #{name}"
  end
end
