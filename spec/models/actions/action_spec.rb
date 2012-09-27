require 'spec_helper'

describe Action do
  # TODO : Check wy it doesn't work
  describe 'associations' do
    it { should have_and_belong_to_many :parents }
    it { should have_and_belong_to_many :children }
  end

  describe '#same_as?' do
    it 'should say that two instances of Action are equal' do
      action_1, action_2 = 2.times.map { FactoryGirl.create(:action) }
      action_1.should be_the_same_as action_2
    end

    it 'should say that an instance of Action is not equal to a subclass of it' do
      action, clip_action = FactoryGirl.create(:action), ClipAction.new
      action.should_not be_the_same_as clip_action
    end
  end

  describe '#merge' do
    it 'should copy all children of an action to self' do
      children_count = 3
      simple_action = FactoryGirl.create(:action)
      action_with_children = FactoryGirl.create(:action_with_children, :children_count => children_count)

      # Do merge
      simple_action.merge(action_with_children)

      # Both actions should have the same number of children
      simple_action.children.length.should eq action_with_children.children.length

      # Each simple_action child should be #same_as? the action with same child
      # index in action_with_children
      simple_action.children.each_with_index do |child, index|
        child.should be_the_same_as action_with_children.children[index]
      end
    end
  end

  describe '#to_builder' do
    it 'should render the action tree as JSON with the :id, :name, :pretty_name, :created_at and :children attributes' do
      action = FactoryGirl.create(:action_with_children, :children_count => 2, :max_child_depth => 2)

      # #to_builder should render the JSON tree of the parent action with
      # 2 children, both containing 2 children
      action.to_builder.target!.should eq({
        :id => action.id,
        :name => action.name,
        :pretty_name => action.pretty_name,
        :created_at => action.created_at,
        :children => [
          {
            :id => action.children[0].id,
            :name => action.children[0].name,
            :pretty_name => action.children[0].pretty_name,
            :created_at => action.children[0].created_at,
            :children => [
              {
                :id => action.children[0].children[0].id,
                :name => action.children[0].children[0].name,
                :pretty_name => action.children[0].children[0].pretty_name,
                :created_at => action.children[0].children[0].created_at,
                :children => []
              },
              {
                :id => action.children[0].children[1].id,
                :name => action.children[0].children[1].name,
                :pretty_name => action.children[0].children[1].pretty_name,
                :created_at => action.children[0].children[1].created_at,
                :children => []
              }
            ]
          },
          {
            :id => action.children[1].id,
            :name => action.children[1].name,
            :pretty_name => action.children[1].pretty_name,
            :created_at => action.children[1].created_at,
            :children => [
              {
                :id => action.children[1].children[0].id,
                :name => action.children[1].children[0].name,
                :pretty_name => action.children[1].children[0].pretty_name,
                :created_at => action.children[1].children[0].created_at,
                :children => []
              },
              {
                :id => action.children[1].children[1].id,
                :name => action.children[1].children[1].name,
                :pretty_name => action.children[1].children[1].pretty_name,
                :created_at => action.children[1].children[1].created_at,
                :children => []
              }
            ]
          }
        ]
      }.to_json)
    end
  end
end
