class ClipsController < ApplicationController
  load_and_authorize_resource :track
  load_and_authorize_resource :through => :track

  def create
    action = ClipActionCreate.new :track => @track, :params => params[:clip]
    if @clip = action.redo
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end

  def offset_clip_source
    action = ClipActionOffsetSource.new :clip => @clip, :offset => :offset
    action.redo
  end

  def offset_clip_begin
    action = ClipActionOffsetBegin.new :clip => @clip, :offset => :offset
    action.redo
  end

  def offset_clip_end
    action = ClipActionOffsetEnd.new :clip => @clip, :offset => :offset
    action.redo
  end
end
