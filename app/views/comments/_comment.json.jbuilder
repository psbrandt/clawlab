json.(comment, :id, :content, :created_at)
json.user do |json|
  json.(comment.user, :name)
end
# json.comments(comment.comments) do |json, comment|
#   json.partial! "comments/comment", :comment => comment
# end
