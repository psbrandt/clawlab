module Node
  
  attr_accessor :parents
  attr_accessor :children

  def <<(child)
    add_child(child)
  end

  def add_child(child)
    raise ArgumentError, "Attempting to add a nil node as child" unless child
    raise "Child #{child} already added!" if @children.include?(child)
    
    @children << child
    child.parents << self unless child.parents.include?(self)
    return child
  end

  # def >>(parent)
  #   add_parent(parent)
  # end

  # def add_parent(parent)
  #   raise ArgumentError, "Attempting to add a nil parent node" unless parent
  #   raise "Parent #{parent.name} already added!" if @parents.has_key?(parent.name)

  #   @parents[parent.name] = parent
  #   parent.children[self.name] = self unless parent.children.has_key?(self.name)
  #   return parent
  # end

  def remove_child!(child)
    return nil unless child

    @children.delete(child)
    child.parents.delete(self)
    child
  end

  def is_root?
    return @parents.empty?
  end

end
