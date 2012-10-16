json.(@song_version, :_id, :title, :bpm, :tracks, :user_id)

json.user do |json|
  json.id @song_version.user.id
  json.name @song_version.user.name
  json.avatar_url @song_version.user.avatar.mini.url
end

json.audio_sources @song_version.audio_sources do |audio_source|
  json.id audio_source.id
  
  json.audio_filename audio_source.audio_filename
end

json.requests current_user.sent_requests.where(:song_version_id => @song_version.id) do |request|
  json.(request, :id)
end

