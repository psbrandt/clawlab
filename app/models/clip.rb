class Clip
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :track

  has_one :source

  field :source_offset, :type => Float, :default => 0
  field :begin_offset, :type => Float, :default => 0
  field :end_offset, :type => Float, :default => 0

end
