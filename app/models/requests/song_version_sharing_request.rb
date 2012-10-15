class SongVersionSharingRequest < Request
  field :song_version_id, :type => Moped::BSON::ObjectId
  
  def accepted
    song_version = SongVersion.find song_version_id
    new_version = receiver.song_versions.new :title => song_version.title, 
      :bpm => song_version.bpm, :song => song_version.song
    # song_version.tracks.each do |track| 
    #   new_version.tracks << track
    # end
    # song_version.audio_sources.each do |audio_source|
    #   new_version.audio_sources << audio_source
    # end
    new_version.create_root_action
    new_version.root_action.merge song_version.root_action, new_version
    new_version.audio_sources = song_version.audio_sources
    new_version.save!
  end
end
