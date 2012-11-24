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
  def update
    clip_tree_params = {
      :song_version_id => @song_version.id,
      :track_id => @track.id,
      :clip_id  => @clip.id
    }

    action = case
    when params[:source_offset] != @clip.source_offset
      ClipActionOffsetSource.new(
        clip_tree_params.merge(:offset => params[:source_offset])
      )
    when params[:begin_offset] != @clip.begin_offset
      ClipActionOffsetBegin.new(
        clip_tree_params.merge(:offset => params[:begin_offset])
      )
    when params[:end_offset] != @clip.end_offset
      ClipActionOffsetEnd.new(
        clip_tree_params.merge(:offset => params[:end_offset])
      )
    end

    if action.redo @song_version
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end

end
