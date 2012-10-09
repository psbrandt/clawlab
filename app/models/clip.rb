class Clip
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :track

  field :audio_source_id, :type => Moped::BSON::ObjectId

  field :source_offset, :type => Float, :default => 0
  field :begin_offset, :type => Float, :default => 0
  field :end_offset, :type => Float, :default => 0

  attr_accessible :id, :audio_source_id, :source_offset, :begin_offset, :end_offset,
  :created_at, :updated_at
  validates_presence_of :audio_source_id
end
