json.array!(@users) do |json, user|
  json.(user, :id, :name)
end
