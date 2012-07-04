class Request
  include Mongoid::Document

  field :from, :type => BSON::ObjectId
  field :to, :type => BSON::ObjectId

  #TODO : field :status, :type => String (?), :default => "PENDING"
  
  # abstract method, need to be implemented by subclasses
  def on_accept
  end
end
