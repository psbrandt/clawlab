class TrackActionDestroy < TrackAction
  # NOTE TODO : maybe the destroy action should just consist in deleting
  # the TrackActionCreate node ...

  parent_finders do |action|
    %W(track_action_create_#{ action.track_id })
  end

  def pretty_name
    "Delete"
  end

  def redo song_version
    # Find the TrackActionCreate for this track and add self as child
    append_to_parent(song_version)

    # and delete the track
    song_version.tracks.find(track_id).destroy
  end

  def undo song_version
    # Find the create action
    create_action = find_parent(song_version)
    # Remove self from children
    remove_from_parent(song_version)
    # Redo the create action
    create_action.redo
    # No children to undo but redoing create action children
    children.each &:redo
  end
end
