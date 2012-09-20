class AudioSource
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  belongs_to :song_version
  belongs_to :clip

  attr_accessible :audio, :remote_audio_url, :audio_cache

  mount_uploader :audio, AudioUploader

  field :uploaded_by, :type => Moped::BSON::ObjectId # user id
  field :author
  field :instrument

  validates_presence_of :audio
end
