class Action
  include Command
  include Node

  # including Mongoid after Node. Fields seem to override attributes declared
  # in Node
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  has_and_belongs_to_many :parents,  :class_name => "Action", :inverse_of => :children
  has_and_belongs_to_many :children, :class_name => "Action", :inverse_of => :parents

  belongs_to :composite_action, :inverse_of => :actions, :autosave => true

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
  def merge action, song_version
    # raise an error if actions are not of same type
    unless self.class.to_s == action.class.to_s
      raise ArgumentError, "#{action.class} and #{self.class} are not equal"
    end

    action.children.each do |child|
      # checking if the action already has such a child
      c = self.children.detect { |c| c.same_as? child }

      # if not, create one with no parents and no children
      unless c
        c = child.class.new(child.as_document.except "_id", "_type", "child_ids", "parent_ids")
        # self.children << c
        c.redo song_version
      end

      # then merge kids
      c.merge child, song_version
    end
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

  # Test if the current action is the same as another. May be overriden by
  # subclasses
  #
  def same_as? action
    return self.class.to_s == action.class.to_s
  end

  class << self
    attr_writer :parent_action_finders

    def parent_finders &block
      @parent_action_finders = block
    end

    # Make parent_action_finders lambda return an empty array as a default
    #
    def parent_action_finders
      @parent_action_finders || lambda { |action| [] }
    end
  end

  # Allows to find the parent action through the specified class method finders
  #
  # @param  [SongVersion]  song_version  The song_version to find the action
  #   against
  #
  def find_parent(song_version)
    finders = self.class.parent_action_finders.call(self)
    finders.reduce(song_version.root_action) do |action, finder|
      action.children.detect { |a| a.name == finder }
    end
  end

  def append_to_parent(song_version)
    find_parent(song_version) << self unless composite_action
  end

  def remove_from_parent(song_version)
    find_parent(song_version).remove_child!(self) unless composite_action
  end
end
