class Band
  
  field :name, :type => String

  has_and_belongs_to_many :users

  validates :name, :uniqueness => true, :presence => true
end
