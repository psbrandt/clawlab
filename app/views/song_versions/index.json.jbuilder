json.(@song_versions.group_by &:song) do |json, (song, song_versions)|
  logger.info song
  json.(song, :id)
  json.song_versions song_versions, :id, :title, :bpm
end
