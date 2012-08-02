class CommentsController < ApplicationController
  load_resource :song
  load_and_authorize_resource :comment, :through => [:song]

  def create
    if @comment.save!
      render # views/comments/create.json.jbuilder
    else
      render :json => @comment.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    if @comment.destroy
      render :json => {:message => "Comment successfully deleted"}, :status => :ok
    else
      render :json => @comment.errors, :status => :unprocessable_entity
    end
  end
end
