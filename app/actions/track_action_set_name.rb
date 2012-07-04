class TrackActionSetName < TrackAction

  field :after, :type => String
  field :before, :type => String

  def redo
    self.update_attributes!(:before => track.name)
    # track.song_version.root_action 
    track.update_attributes!(:name => after)
    # song_version.save!
  end

  def undo
  end
end
