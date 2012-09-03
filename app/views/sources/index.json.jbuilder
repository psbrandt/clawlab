json.sources @sources do |json, source|
  json.partial! "sources/source", :source => source
end
