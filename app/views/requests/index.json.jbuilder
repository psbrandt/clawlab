json.array!(@requests) do |json, request|
  json.(request, :id, :status, :sender_id, :receiver_id)
end
