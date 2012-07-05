class Request
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :sender,   :class_name => "User", :inverse_of => :send_requests
  belongs_to :receiver, :class_name => "User", :inverse_of => :reveived_requests

  field :status, :type => String, :default => "pending"
  
  validates_inclusion_of :status, :in => ["pending", "accepted"]

  after_update do
    accept if status == "accepted"
  end
  
  # abstract method, need to be implemented by subclasses
  def accept
  end
end
