class Song
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :song_versions
  belongs_to :created_by, :class_name => "User"
  embeds_many :comments, :as => :commentable
  embeds_many :todos
  # Return all users involved in the project (users having a version of the 
  # song)
  def collaborators
    :song_version.map(&:user).uniq
  end
end
