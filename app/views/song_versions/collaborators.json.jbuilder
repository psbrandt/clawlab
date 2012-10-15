json.users (@song_version.song.collaborators - [current_user]) do |json, user|
  json.(user, :name)
  json.avatar_url asset_path(user.avatar.thumb.url)
  json.profile_url show_user_path(user)
  json.song_versions user.song_versions.where(:song_id => @song_version.song.id)
end
