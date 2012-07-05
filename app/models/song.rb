class Song
  include Mongoid::Document

  has_many :song_versions
  belongs_to :created_by, :class_name => "User"
  
  # Return all users involved in the project (users having a version of the 
  # song)
  def collaborators
    :song_version.map(&:user).uniq
  end
end
