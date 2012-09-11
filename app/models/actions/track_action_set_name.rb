class TrackActionSetName < TrackAction

  field :name, :type => String
  field :old_name, :type => String

  def redo
    self.update_attributes!(:old_name => track.name)
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    } << self
    song_version.tracks.find(track_id).update_attributes!(:name => name)
  end

  def undo
    song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }.remove_child!(self)
    song_version.tracks.find(track_id).update_attributes!(:name => old_name)

    # undoing children (dependant actions)
    children.each &:undo
  end

  def same_as? action
    super(action) && self.name = action.name
  end
end
