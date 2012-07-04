class Song
  include Mongoid::Document

  has_many :song_versions
end
