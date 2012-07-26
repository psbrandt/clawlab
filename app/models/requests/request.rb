class Request
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :sender,   :class_name => "User", :inverse_of => :send_requests
  belongs_to :receiver, :class_name => "User", :inverse_of => :reveived_requests

  field :status, :type => String, :default => "pending"
  
  validates_inclusion_of :status, :in => ["pending", "accepted"]

  after_update do
    if status == "accepted"
      # execute accepted callback
      accepted
      # destroy the requests
      self.destroy
    end
  end
  
  # Action to be done when request is accepted by receiver (abstract method, 
  # need to be implemented by subclasses)
  def accepted
  end
end
