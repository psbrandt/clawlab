class ClipsController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :track, :through => :song_version
  load_and_authorize_resource :clip, :through => :track

  def create
    action = ClipActionCreate.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :params => (params[:clip] || {})
    )
    if @clip = action.redo(@song_version)
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end
  
  def destroy
    action = ClipActionDestroy.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :clip_id => @clip.id
    )
    action.redo @song_version
    render :json => {:message => "Clip successfully destroyed"}
  end

  # Call the right method in function of the given params
  # TODO : do it cleaner
  def update
    offset_source if params[:source_offset] != @clip.source_offset
    offset_begin  if params[:begin_offset]  != @clip.begin_offset
    offset_end    if params[:end_offset]    != @clip.end_offset
  end

  def offset_source
    action = ClipActionOffsetSource.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :clip_id  => @clip.id,
      :offset => params[:source_offset]
    )
    if @clip = action.redo(@song_version)
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end    
  end

  def offset_begin
    action = ClipActionOffsetBegin.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :clip_id  => @clip.id,
      :offset => params[:begin_offset]
    )
    action.redo @song_version
    if @clip.save!
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end

  def offset_end
    action = ClipActionOffsetEnd.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :clip_id  => @clip.id,
      :offset => params[:end_offset]
    )
    action.redo @song_version
    if @clip.save!
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end
end
