class SongVersionActionCreate < SongVersionAction
  belongs_to :song_version, :inverse_of => :root_action

  def pretty_name
    "Create song version"
  end

  def name
    "song_version_action_create_#{song_version.id}"
  end

end
