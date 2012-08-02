json.comments @comments do |json, comment|
  json.partial! "comments/comment", :comment => comment
end
