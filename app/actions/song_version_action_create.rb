class SongVersionActionCreate < SongVersionAction
  belongs_to :song_version, :inverse_of => :root_action

  def name
    "song_version_action_create_#{song_version_id}"
  end
end
