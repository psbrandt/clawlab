json.(action, :name)
json.children(action.children) do |j, child|
  j.partial! "actions/action", :action => child
end
