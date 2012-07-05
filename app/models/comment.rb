class Comment
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, :type => String
  belongs_to :user

  embedded_in :commentable, :polymorphic => true

  validates_presence_of :content, :user
end
