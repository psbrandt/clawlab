class Track
  include Mongoid::Document

  embedded_in :song_version

  field :name, :type => String, :default => "New track"
  field :volume, :type => Float, :default => 0

  embeds_many :clips
end
