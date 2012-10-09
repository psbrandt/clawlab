class TrackActionDestroy < TrackAction
  # NOTE TODO : maybe the destroy action should just consist in deleting 
  # the TrackActionCreate node ...

  def pretty_name
    "Delete"
  end

  def redo song_version
    # Find the TrackActionCreate for this track and add self as child
    song_version.root_action.children.detect { |a| 
      a.name == "track_action_create_#{track_id}"
    } << self
    # and delete the track
    song_version.tracks.find(track_id).destroy
  end

  def undo song_version
    # Find the create action
    create_action = song_version.root_action.children.detect { |a|
      a.name == "track_action_create_#{track_id}"
    }
    # remove self from children
    create_action.remove_child!(self)
    # redo the create action
    create_action.redo
    # no children to undo but redoing create action children
    children.each &:redo
  end
end
