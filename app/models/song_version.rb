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
    song_version.(self, :id, :title, :bpm, :tracks, :user_id)

    song_version.user(self.user, :id, :name)

    song_version.audio_sources audio_sources do |j, audio_source|
      j.(audio_source, :id, :author, :instrument, :uploaded_by, :length)
      j.audio_filename audio_source.audio_filename
      j.url audio_source.audio.url
    end

    # add root_action ( song_version.root_action root_action.to_builder didn't
    # work here ...
    song_version.root_action do |j|
      root_action.to_builder.attributes!.each do |key, value|
        j.set! key, value
      end
    end

    song_version.collaborators song.collaborators - [user] do |j, user|
      j.(user, :name)
      j.avatar_url user.avatar.thumb.url
      j.song_versions user.song_versions.where(:song_id => song.id)
    end

    song_version.requests user.sent_requests.where(:song_version_id => id) do |j, request|
      j.(request, :id)
    end

    song_version
  end
end
