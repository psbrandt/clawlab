class Todo
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :song

  field :done, :type => Boolean, :default => false
  field :title, :type => String

  embeds_many :comments, :as => :commentable

  belongs_to :created_by, :class_name => "User"
  belongs_to :assigned_to, :class_name => "User"

  validates_presence_of :created_by, :title, :done
end
