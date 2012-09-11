class TracksController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :track, :through => :song_version

  def index
    @tracks = @song_version.tracks
  end

  def create
    action = TrackActionCreate.new(
      :song_version_id => @song_version.id, 
      :params => (params[:track] || {})
    )
    if @track = action.redo
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    action = TrackActionDestroy.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id
    )
    action.redo
    render :json => {:message => "Track successfully destroyed"}
  end

  def set_name
    action = TrackActionSetName.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, 
      :name => params[:name]
    )
    action.redo
    if @track.save!
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

  def set_volume
    action = TrackActionSetVolume.new(
      :song_version_id => @song_version.id,
      :track_id => @track.id, :volume => params[:volume]
    )
    action.redo
    if @track.save!
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

end
