json.array!(@tracks) do |json, track|
  json.partial! "tracks/track", :track => track
end
