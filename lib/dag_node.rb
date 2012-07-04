class DagNode
  
  attr_reader :name

  attr_accessor :parents
  attr_accessor :children

  def initialize(name) 
    @name = name
    self.set_as_root!
    @children = Hash.new
    @parents = Hash.new
  end

  def <<(child)
    add_child(child)
  end

  def add_child(child)
    raise ArgumentError, "Attempting to add a nil node as child" unless child
    raise "Child #{child.name} already added!" if @children.has_key?(child.name)
    
    @children[child.name] = child
    child.parents[self.name] = self unless child.parents.has_key?(self.name)
    return child
  end

  def >>(parent)
    add_parent(parent)
  end

  def add_parent(parent)
    raise ArgumentError, "Attempting to add a nil parent node" unless parent
    raise "Parent #{parent.name} already added!" if @parents.has_key?(parent.name)

    @parents[parent.name] = parent
    parent.children[self.name] = self unless parent.children.has_key?(self.name)
    return parent
  end

  def remove_child!(child)
    return nil unless child

    @children.delete(child.name)
    child.parents.delete(self.name)
    child
  end

  def set_as_root!
    @parents = Hash.new
  end

  def is_root?
    @parents.size == 0
  end

end
