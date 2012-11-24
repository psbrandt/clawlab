class Clip
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :track

  field :audio_source_id, :type => Moped::BSON::ObjectId
  field :audio_source_url, :type => String

  field :source_offset, :type => Float, :default => 0
  field :begin_offset, :type => Float, :default => 0
  field :end_offset, :type => Float, :default => 0

  field :length, :type => Float

  attr_accessible :id, :audio_source_id, :source_offset, :begin_offset,
    :end_offset, :created_at, :updated_at, :length

  validates_presence_of :audio_source_id
  validates_presence_of :length, :if => proc { |clip| clip.audio_source }

  before_validation do
    # If we don't have the length stored or one of the offsets has changed
    if self.audio_source &&
       (!self.length || self.begin_offset_changed? || self.end_offset_changed?)

      # Get audio source length
      source_length = self.audio_source.length
      # Set length of clip
      self.length = source_length - self.begin_offset - self.end_offset
    end
  end

  # Shortcut accessor to clip's audio source stored in song version and fetched
  # through self.audio_source_id
  def audio_source
    if (source_id = audio_source_id.presence)
      track.song_version.audio_sources.where(:id => source_id).first
    end
  end
end
