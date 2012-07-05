class Band
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, :type => String

  belongs_to :created_by, :class_name => "User"
  has_and_belongs_to_many :users

  validates :name, :uniqueness => true, :presence => true
  validates_presence_of :created_by
end
