json.array!(@song_versions) do |json, song_version|
  json.(song_version, :id, :title, :bpm)
end
