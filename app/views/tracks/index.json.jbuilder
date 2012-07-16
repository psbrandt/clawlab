json.array!(@tracks) do |json, track|
 json.(track, :id, :name)
end
