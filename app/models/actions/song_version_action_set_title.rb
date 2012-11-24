class SongVersionActionSetTitle < SongVersionAction
  include SetAttributeAction

  sets_song_version_attribute :title, :type => String

  def pretty_name
    "Set title #{title}"
  end
end
