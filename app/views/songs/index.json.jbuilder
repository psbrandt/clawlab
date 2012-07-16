json.array!(@songs) do |json, song|
  json.(song, :id)
end
