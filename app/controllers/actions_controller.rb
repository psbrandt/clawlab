class ActionsController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :root_action, :class => "Action", :through => :song_version, :singleton => true

  def update

  end

  def show
    render :json => @root_action.to_builder.target!
  end

end
