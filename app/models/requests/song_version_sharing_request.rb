class SongVersionSharingRequest < Request
  field :song_version_id, :type => BSON::ObjectId
  
  def accepted
    song_version = SongVersion.find song_version_id
    new_version = receiver.song_versions.new song_version.clone.attributes
    new_version.create_root_action
    new_version.root_action.merge song_version.root_action
    new_version.save!
  end
end
