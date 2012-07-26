class SongVersionAction < Action
  belongs_to :song_version

  def same_as? action
    super(action) && self.song_version == action.song_version
  end
end
