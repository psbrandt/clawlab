class TrackActionDestroy < TrackAction
  # NOTE TODO : maybe the destroy action should just consist in deleting 
  # the TrackActionCreate node ...

  def redo
    sv = song_version
    logger.info sv.to_json
    # Find the TrackActionCreate for this track and add self as child
    song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{track_id}"
    } << self
    # and delete the track
    song_version.tracks.delete(track_id)
  end

  def undo
    # Find the create action
    create_action = song_version.root_action.children.find { |a|
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
