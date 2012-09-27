class Action
  include Command
  include Node

  # including Mongoid after Node. Fields seem to override attributes declared
  # in Node
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  # field :parents, :type => Array, :default => []
  # field :children, :type => Array, :default => []
  # NOTE : tought about using recursively_embeds_many but it didn't fit so well

  has_and_belongs_to_many :parents,  :class_name => "Action", :inverse_of => :children
  has_and_belongs_to_many :children, :class_name => "Action", :inverse_of => :parents

  # Node methods use instance variable. We need to set them before we can do
  # anything
  after_initialize do
    @parents  = self.parents
    @children = self.children
  end

  # TODO : try to uncomment this, and remove the last line in undo methods in 
  # sub classes
  # after_undo do 
  #   children.each { |a| a.undo unless a.undone }
  # end

  # This method will be used to find an action in the tree. We return id by
  # by default but some action might override it to return a more convenient
  # name
  def name
    id.to_s
  end

  # Used to render a meaningful name. Overriden by sub classes
  def pretty_name
  end

  # Add all children from the given action to self.children
  def merge action
    # raise an error if actions are not of same type
    unless self.class.to_s == action.class.to_s
      raise ArgumentError, "#{action.class} and #{self.class} are not equal"
    end

    action.children.each do |child|
      # checking if the action already has such a child
      c = self.children.detect { |c| c.same_as? child }

      # if not, create one with no parents and no children
      unless c
        c = child.class.new(child.as_document.except "_id", "child_ids", "parent_ids")
        self.children << c
      end

      # then merge kids
      c.merge child
    end
  end

  # Test if the current action is the same as another. May be overriden by
  # subclasses
  def same_as? action
    return self.class.to_s == action.class.to_s
  end

  # Return a json view of the action
  def to_builder
    action = Jbuilder.new
    # add id and name
    action.(self, :id, :name, :pretty_name, :created_at)

    # add children
    action.children(self.children) do |builder, child|
      child.to_builder.attributes!.each do |key, value|
        builder.set! key, value
      end
    end
    action
  end

end
