class Band
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, :type => String

  has_and_belongs_to_many :users

  attr_accessible :name, :avatar, :avatar_cache, :remove_avatar
  mount_uploader :avatar, ImageUploader

  validates :name, :uniqueness => true, :presence => true
  # validates_presence_of   :avatar
  # validates_integrity_of  :avatar
  # validates_processing_of :avatar
end
