class ClipsController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :track, :through => :song_version
  load_and_authorize_resource :clip, :through => :track

  def create
    action = ClipActionCreate.new(
      :track => @track, 
      :params => (params[:clip] || {})
    )
    if @clip = action.redo
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end
  
  def destroy
    action = ClipActionDestroy.new :clip => @clip
    action.redo
  end

  def offset_source
    action = ClipActionOffsetSource.new :clip => @clip, :offset => params[:offset]
    action.redo
    if @clip.save!
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end    
  end

  def offset_begin
    action = ClipActionOffsetBegin.new :clip => @clip, :offset => params[:offset]
    action.redo
    if @clip.save!
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end

  def offset_end
    action = ClipActionOffsetEnd.new :clip => @clip, :offset => params[:offset]
    action.redo
    if @clip.save!
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end
end
