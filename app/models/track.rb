class Track
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :song_version

  field :name, :type => String, :default => "New track"
  field :volume, :type => Float, :default => 0

  embeds_many :clips

  attr_accessible :_id, :name, :volume, :updated_at, :created_at
  validates_numericality_of :volume, :less_than_or_equal_to => 6
  validates_presence_of :name
end
