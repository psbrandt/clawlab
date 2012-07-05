class TrackActionSetName < TrackAction

  field :name, :type => String
  field :old_name, :type => String

  def redo
    self.update_attributes!(:old_name => track.name)
    track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{track.id}"
    } << self
    track.update_attributes!(:name => name)
    track.save!
  end

  def undo
    track.song_version.root_action.children.find { |a|
      a.name == "track_action_create_#{track.id}"
    }.remove_child!(self)
    track.update_attributes!(:name => old_name)
    track.save!

    # undoing children (dependant actions)
    children.each &:undo
  end
end
