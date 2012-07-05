class Request
  include Mongoid::Document

  belongs_to :sender,   :class_name => "User", :inverse_of => :send_requests
  belongs_to :receiver, :class_name => "User", :inverse_of => :reveived_requests

  #TODO : field :status, :type => String (?), :default => "PENDING"
  
  # abstract method, need to be implemented by subclasses
  def on_accept
  end
end
