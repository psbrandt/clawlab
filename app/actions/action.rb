class Action < DagNode
  include Mongoid::Document
  include Command

  field :parents, :type => Hash, :default => {}
  field :children, :type => Hash, :default => {}
  # has_and_belongs_to_many :parents, :inverse_of => :children
  # has_and_belongs_to_many :children, :class_name => "Action", :inverse_of => :parents

  after_initialize do
    @children = children
    @parents  = parents
    @name     = name
  end

  def name
    id.to_s
  end

end
