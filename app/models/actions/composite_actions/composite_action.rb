class CompositeAction < Action
  has_many :actions, :inverse_of => :composite_action, :autosave => true

  def initialize options = {}
    super options
    unless actions.length > 0
      # Check if we are given some params especially for one of the component
      # actions by checking options keys action_names
      scoped_options = Hash[self.class.component_action_models.map do |action_name, klass|
        # Memoize action_name pattern to match against
        action_name_pattern = /^#{ action_name }_/

        # Iterate through options and build custom options list for specific
        # component action
        processed_options = options.reduce({}) do |scoped_options, arg|
          # Memoize option key
          key = arg.first
          # If key matches our action_name pattern
          if key.to_s =~ action_name_pattern
            # Remove action_name to name the key that'll be passed to our
            # componenent action
            new_key = key.to_s.gsub(action_name_pattern, '')
            # Store the option and delete it from being given to other component
            # actions so we avoid options name collisions
            scoped_options[new_key] = options.delete(key)
          end
          # Pass the possibly filled params hash
          scoped_options
        end
        # Return index / options pair to be casted to a hash next
        [action_name, processed_options]
      end]

      self.actions = self.class.component_action_models.map do |action|
        # Extract action name and class from components_actions class list
        action_name, klass = action
        # Merge specific action options to gloabal params if needed
        if (action_options = scoped_options[action_name])
          klass.new options.merge(action_options)
        else
          klass.new options
        end
      end
    end
  end

  # Do each contained action
  def redo song_version
    actions.each { |action| action.redo song_version }
    append_to_parent(song_version)
  end

  # Undo each action
  def undo song_version
    remove_from_parent(song_version)
    actions.reverse.each { |action| action.undo song_version }
    save
  end

  # Access an action by its name
  #
  # @param  [Symbol]  name  The component name of the action
  #
  def action(name)
    index = self.class.component_action_indexes[name]
    actions[index]
  end

  # Checks if we also have a composite action, if we have the same amount of
  # contained actions and that each contained action are the same and in the
  # same order
  #
  # @params  [Action]  action  The action to be compared with the current one
  #
  def same_as? action
    super(action) &&
      actions.length == action.actions.length &&
      actions.each_with_index.all? do |a, index|
        action.actions[index].same_as? a
      end
  end

  class << self
    attr_accessor :component_action_models
    attr_accessor :component_action_indexes

    # Allows declaring the components actions with the following kind of call :
    #
    #   class SomeClass < CompositeAction
    #     compound_of :component_action_1, :component_action_2, (...)
    #   end
    #
    # @param  [Symbol]  name
    # @param  [Class]   action
    # @param  [Hash]    options
    #
    def compound_of name, action, options = {}
      # Init containers
      @component_action_models ||= {}
      @component_action_indexes ||= {}
      # Process macro
      self.component_action_models[name] = action
      self.component_action_indexes[name] = self.component_action_models.length - 1
    end
  end
end
