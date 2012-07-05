class SongVersion
  include Mongoid::Document

  field :title, :type => String
  field :bpm, :type => Float

  belongs_to :user
  belongs_to :song
  has_one :root_action, :class_name => "SongVersionActionCreate", :dependent => :destroy

  embeds_many :tracks

  validates_presence_of :title, :bpm, :user, :song, :root_action
end
