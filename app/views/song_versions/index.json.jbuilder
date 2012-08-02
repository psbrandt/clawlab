json.songs (@song_versions.group_by &:song) do |json, (song, song_versions)|
  json.(song, :id)
  json.song_versions song_versions, :id, :title, :bpm
end
