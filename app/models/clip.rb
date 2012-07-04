class Clip
  include Mongoid::Document

  embedded_in :track

  has_one :source

  field :source_offset, :type => Float
  field :begin_offset, :type => Float
  field :end_offset, :type => Float

end
