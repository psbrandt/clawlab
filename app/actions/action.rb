class Action
  include Command
  include Node

  # including Mongoid after Node. Fields seems to override attributes declared
  # in Node
  include Mongoid::Document 

  field :parents, :type => Array, :default => []
  field :children, :type => Array, :default => []
  # has_and_belongs_to_many :parents, :inverse_of => :children
  # has_and_belongs_to_many :children, :class_name => "Action", :inverse_of => :parents

  after_initialize do
    @parents  = self.parents
    @children = self.children
  end

  def name
    id.to_s
  end

end
