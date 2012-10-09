class SongVersion
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, :type => String
  field :bpm, :type => Float

  belongs_to :user
  belongs_to :song
  has_one :root_action, :class_name => "SongVersionActionCreate", :dependent => :destroy

  embeds_many :tracks, :cascade_callbacks => true
  embeds_many :audio_sources

  validates_presence_of :title, :bpm, :user, :song, :root_action

  # format to json
  def to_builder
    song_version = Jbuilder.new
    
    # add id, title and tracks
    song_version.(self, :id, :title, :bpm, :tracks)
 
    song_version.audio_sources audio_sources do |builder, audio_source|
      builder.(audio_source, :id, :author, :instrument, :uploaded_by)      
      builder.audio_filename audio_source.audio_filename
      builder.url audio_source.audio.url
    end

    # add root_action ( song_version.root_action root_action.to_builder didn't
    # work here ...
    song_version.root_action do |builder|
      root_action.to_builder.attributes!.each do |key, value|
        builder.set! key, value
      end
    end

    song_version
  end
end
