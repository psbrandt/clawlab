class ClipActionDestroy < ClipAction

  parent_finders do |action|
    %W(track_action_create_#{ action.track_id } clip_action_create_#{ action.clip_id })
  end

  def pretty_name
    "Delete clip"
  end

  def redo song_version
    # Remove action from tree
    remove_from_parent(song_version)
    # Find clip in song tree and delete it
    song_version.tracks.find(track_id).clips.find(clip_id).delete
  end

  def undo song_version
    # Get parent track's clips and insert back the clip
    song_version.tracks.find(track_id).clips << clip
    # Append current action to tree
    append_to_parent(song_version)
    # undoing children (dependant actions)
    children.each &:undo
  end

end
