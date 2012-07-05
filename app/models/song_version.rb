class SongVersion
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, :type => String
  field :bpm, :type => Float

  belongs_to :user
  belongs_to :song
  has_one :root_action, :class_name => "SongVersionActionCreate", :dependent => :destroy

  embeds_many :tracks, :cascade_callbacks => true

  validates_presence_of :title, :bpm, :user, :song, :root_action
end
