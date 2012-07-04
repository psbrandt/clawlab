class SongVersionActionCreate < SongVersionAction
  belongs_to :song_version, :inverse_of => :root_action
end
