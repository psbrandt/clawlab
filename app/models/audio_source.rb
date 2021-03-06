class AudioSource
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  embedded_in :song_version

  attr_accessible :id, :audio, :remote_audio_url, :audio_cache, :audio_filename,
    :uploaded_by, :length

  mount_uploader :audio, AudioUploader

  field :uploaded_by, :type => Moped::BSON::ObjectId#, :class_name => "User"
  field :author
  field :instrument

  field :length, :type => Float

  validates_presence_of :audio, :uploaded_by, :length

  def to_builder
    audio_source = Jbuilder.new
    audio_source.(self, :id, :author, :instrument, :uploaded_by, :length)
    audio_source.audio_filename self.audio_filename
    audio_source.url self.audio.url
    audio_source
  end

end
