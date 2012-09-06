class Band
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, :type => String

  has_and_belongs_to_many :users

  attr_accessible :name, :avatar, :avatar_cache, :remove_avatar
  mount_uploader :avatar, ImageUploader

  validates_presence_of :name
  # validates_presence_of   :avatar
  # validates_integrity_of  :avatar
  # validates_processing_of :avatar

  has_many :requests, :class_name => "BandRequest"
end
