class Action
  include Command
  include Node

  # including Mongoid after Node. Fields seems to override attributes declared
  # in Node
  include Mongoid::Document 

  field :parents, :type => Array, :default => []
  field :children, :type => Array, :default => []
  # NOTE : tought about using recursively_embeds_many but it didn't fit so well

  # has_and_belongs_to_many :parents, :inverse_of => :children
  # has_and_belongs_to_many :children, :class_name => "Action", :inverse_of => :parents

  # Node methods use instance variable. We need to set them before we can do 
  # anything
  after_initialize do
    @parents  = parents
    @children = self.children
  end

  # When undo is called, we want to call undo on the children too. Would be cool
  # to be able to write something like this ... 
  # after_undo do {children.each &:undo} end

  # This method will be used to find an action in the tree. We return id by
  # by default but some action might override it to return a more meaningful
  # name
  def name
    id.to_s
  end

end
