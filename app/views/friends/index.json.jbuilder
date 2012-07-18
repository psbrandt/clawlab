json.array!(@friends) do |json, friend|
  json.(friend, :id, :name, :email)
end
