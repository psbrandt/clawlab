class AudioSource
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  embedded_in :song_version

  attr_accessible :audio, :remote_audio_url, :audio_cache

  mount_uploader :audio, AudioUploader

  field :uploaded_by, :type => Moped::BSON::ObjectId # user id
  field :author
  field :instrument

  validates_presence_of :audio
end
