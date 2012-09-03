class AudioSource
  include Mongoid::Document

  embedded_in :song_version

  attr_accessible :audio, :remote_audio_url, :audio_cache

  mount_uploader :audio, AudioUploader

  field :uploaded_by, :type => Moped::BSON::ObjectId # user id
  field :author
  field :instrument
end
